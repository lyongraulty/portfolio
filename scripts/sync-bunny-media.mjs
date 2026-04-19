import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const OUTPUT_PATH = path.join(rootDir, "content", "bunny-media.json");
const ENV_FILE_PATH = path.join(rootDir, ".env.local");
const VIDEO_EXT_RE = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i;
const IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|gif|avif|svg)$/i;
const CARD_NAME_RE = /(^|\/)[^/]*_card\.[a-z0-9]+$/i;

function toText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

async function loadEnvLocal() {
  let raw;
  try {
    raw = await readFile(ENV_FILE_PATH, "utf8");
  } catch {
    return;
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    const key = match[1];
    if (process.env[key] !== undefined) continue;

    let value = match[2].trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function toPosix(input) {
  return toText(input).replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

function joinPosix(...parts) {
  return parts
    .map((part) => toPosix(part))
    .filter(Boolean)
    .join("/");
}

function splitCsv(value) {
  return toText(value)
    .split(",")
    .map((segment) => toPosix(segment))
    .filter(Boolean);
}

function toSlug(value) {
  return toPosix(value).toLowerCase();
}

function normalizeFsPath(input) {
  return toText(input).replace(/[\\/]+$/g, "");
}

function isVideoFile(filePath) {
  return VIDEO_EXT_RE.test(filePath);
}

function isImageFile(filePath) {
  return IMAGE_EXT_RE.test(filePath);
}

function mediaTypeFromPath(filePath) {
  return isVideoFile(filePath) ? "video" : "image";
}

function sortPaths(paths) {
  return [...paths].sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

function pickCardPath(paths) {
  const byConvention = paths.find((item) => CARD_NAME_RE.test(item));
  if (byConvention) return byConvention;

  const preferred = paths.find((item) => /(^|\/)(cover|card|thumb|thumbnail|poster|preview)\./i.test(item));
  if (preferred) return preferred;
  const firstVideo = paths.find((item) => isVideoFile(item));
  if (firstVideo) return firstVideo;
  return paths[0] ?? "";
}

function pickHeroPath(paths, cardPath) {
  const withoutCard = paths.filter((item) => item !== cardPath);
  const preferred = withoutCard.find((item) => /(^|\/)(reel|hero|main|intro|open|primary)\./i.test(item));
  if (preferred) return preferred;
  return withoutCard.find((item) => isVideoFile(item)) ?? "";
}

function toMediaItem(filePath) {
  return {
    role: mediaTypeFromPath(filePath),
    type: mediaTypeFromPath(filePath),
    src: filePath,
  };
}

function inferBlocks(paths, cardPath) {
  const files = sortPaths(paths);
  const heroPath = pickHeroPath(files, cardPath);
  const used = new Set([cardPath, heroPath].filter(Boolean));
  const gallery = files.filter((item) => !used.has(item));
  const blocks = [];

  if (heroPath) {
    blocks.push({
      slot: 1,
      layout: "single",
      title: "Hero",
      copy: "",
      items: [toMediaItem(heroPath)],
    });
  }

  if (gallery.length > 0) {
    blocks.push({
      slot: blocks.length + 1,
      layout: gallery.length > 1 ? "two-up" : "single",
      title: "Gallery",
      copy: "",
      items: gallery.map((item) => toMediaItem(item)),
    });
  }

  if (blocks.length === 0 && cardPath) {
    blocks.push({
      slot: 1,
      layout: "single",
      title: "Media",
      copy: "",
      items: [toMediaItem(cardPath)],
    });
  }

  return blocks;
}

function buildStorageBaseUrl() {
  const zone = toText(process.env.BUNNY_STORAGE_ZONE);
  const rawHost = toText(process.env.BUNNY_STORAGE_HOST) || "storage.bunnycdn.com";
  const host = rawHost.replace(/^https?:\/\//i, "").replace(/\/+$/g, "");
  if (!zone) {
    throw new Error("Missing BUNNY_STORAGE_ZONE.");
  }
  return `https://${host}/${encodeURIComponent(zone)}`;
}

function getAccessKey() {
  const accessKey = toText(process.env.BUNNY_STORAGE_API_KEY);
  if (!accessKey) {
    throw new Error("Missing BUNNY_STORAGE_API_KEY.");
  }
  return accessKey;
}

async function fetchFolderEntries(storageBaseUrl, accessKey, folderPath) {
  const normalized = toPosix(folderPath);
  const encodedPath = normalized
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const url = `${storageBaseUrl}/${encodedPath}`;
  const response = await fetch(url, {
    headers: {
      AccessKey: accessKey,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Bunny request failed for "${normalized}" with ${response.status}.`);
  }

  const json = await response.json();
  return Array.isArray(json) ? json : [];
}

function entryName(entry) {
  return toText(entry?.ObjectName ?? entry?.objectName ?? entry?.Name ?? entry?.name);
}

function entryIsDirectory(entry) {
  return Boolean(entry?.IsDirectory ?? entry?.isDirectory);
}

async function listProjectFolders(storageBaseUrl, accessKey, rootPath) {
  const entries = await fetchFolderEntries(storageBaseUrl, accessKey, rootPath);
  return entries
    .filter((entry) => entryIsDirectory(entry))
    .map((entry) => entryName(entry))
    .filter(Boolean)
    .map((name) => ({ slug: toPosix(name), folder: joinPosix(rootPath, name) }));
}

async function listProjectFoldersLocal(localRootPath) {
  const entries = await readdir(localRootPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ slug: toPosix(entry.name), folderFsPath: path.join(localRootPath, entry.name) }));
}

async function listFilesRecursive(storageBaseUrl, accessKey, folderPath) {
  const stack = [toPosix(folderPath)];
  const files = [];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fetchFolderEntries(storageBaseUrl, accessKey, current);

    for (const entry of entries) {
      const name = entryName(entry);
      if (!name) continue;
      const itemPath = joinPosix(current, name);

      if (entryIsDirectory(entry)) {
        stack.push(itemPath);
      } else if (isVideoFile(itemPath) || isImageFile(itemPath)) {
        files.push(itemPath);
      }
    }
  }

  return sortPaths(files);
}

async function listFilesRecursiveLocal(rootProjectDir, mediaRoot) {
  const files = [];
  const stack = [rootProjectDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }

      const relFromProject = toPosix(path.relative(rootProjectDir, full));
      const projectName = toPosix(path.basename(rootProjectDir));
      const relMediaPath = joinPosix(mediaRoot, projectName, relFromProject);
      if (isVideoFile(relMediaPath) || isImageFile(relMediaPath)) {
        files.push(relMediaPath);
      }
    }
  }

  return sortPaths(files);
}

async function readExistingManifest() {
  try {
    const raw = await readFile(OUTPUT_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeEntry(existing, generated) {
  if (!existing || typeof existing !== "object") {
    return generated;
  }

  const existingBlocks = Array.isArray(existing?.media?.blocks) ? existing.media.blocks : [];
  const existingCard = existing?.media?.card && typeof existing.media.card === "object" ? existing.media.card : null;
  const generatedCardSrc = toText(generated?.media?.card?.src);
  const useGeneratedCard = CARD_NAME_RE.test(generatedCardSrc);

  return {
    ...generated,
    ...existing,
    slug: generated.slug,
    folder: generated.folder,
    media: {
      ...(generated.media ?? {}),
      ...(existing.media ?? {}),
      card: useGeneratedCard ? generated.media.card : existingCard ?? generated.media.card,
      blocks: existingBlocks.length > 0 ? existingBlocks : generated.media.blocks,
    },
    // Keep a current inventory snapshot to make URL copy/paste easy.
    files: generated.files,
    updated_at: new Date().toISOString(),
  };
}

function printUsage() {
  process.stdout.write(
    [
      "Usage: npm run sync:bunny-media",
      "",
      "Required env:",
      "  BUNNY_STORAGE_ZONE=<storage zone name>",
      "  BUNNY_STORAGE_API_KEY=<storage api key>",
      "",
      "Optional env:",
      "  BUNNY_STORAGE_HOST=storage.bunnycdn.com",
      "  BUNNY_MEDIA_ROOT=projects",
      "  BUNNY_PROJECT_SLUGS=colossal,drumwave",
      "  BUNNY_LOCAL_SYNC_ROOT=C:\\Users\\you\\BunnySync\\media_live\\projects",
      "",
      "Output:",
      "  content/bunny-media.json",
    ].join("\n"),
  );
}

async function main() {
  await loadEnvLocal();

  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printUsage();
    return;
  }

  const mediaRoot = toPosix(process.env.BUNNY_MEDIA_ROOT || "projects");
  const localSyncRoot = normalizeFsPath(process.env.BUNNY_LOCAL_SYNC_ROOT);
  const autoBlocks = /^(1|true|yes)$/i.test(toText(process.env.BUNNY_AUTO_BLOCKS));
  const storageBaseUrl = localSyncRoot ? "" : buildStorageBaseUrl();
  const accessKey = localSyncRoot ? "" : getAccessKey();
  const requestedSlugs = splitCsv(process.env.BUNNY_PROJECT_SLUGS);
  const excludedSlugs = new Set(splitCsv(process.env.BUNNY_EXCLUDED_SLUGS || "reel,sandbox,music").map(toSlug));
  const existingManifest = await readExistingManifest();
  const existingBySlug = new Map(
    existingManifest
      .map((entry) => [toPosix(entry?.slug), entry])
      .filter(([slug]) => slug),
  );

  const discoveredFolders = localSyncRoot
    ? await listProjectFoldersLocal(localSyncRoot)
    : await listProjectFolders(storageBaseUrl, accessKey, mediaRoot);
  const targetFolders = requestedSlugs.length
    ? requestedSlugs.map((slug) => ({
        slug,
        folder: joinPosix(mediaRoot, slug),
        ...(localSyncRoot ? { folderFsPath: path.join(localSyncRoot, slug) } : {}),
      }))
    : discoveredFolders;

  const filteredTargets = targetFolders.filter((target) => !excludedSlugs.has(toSlug(target.slug)));

  if (filteredTargets.length === 0) {
    throw new Error(`No project folders found under "${mediaRoot}".`);
  }

  const mergedEntries = [];

  for (const target of filteredTargets) {
    let files = [];
    try {
      files = localSyncRoot
        ? await listFilesRecursiveLocal(target.folderFsPath, mediaRoot)
        : await listFilesRecursive(storageBaseUrl, accessKey, target.folder);
    } catch (error) {
      process.stdout.write(
        `Skipping ${target.slug}: ${error instanceof Error ? error.message : String(error)}\n`,
      );
      continue;
    }
    if (files.length === 0) {
      process.stdout.write(`Skipping ${target.slug}: no media files found.\n`);
      continue;
    }

    const cardPath = pickCardPath(files);
    const hasCardByConvention = files.some((item) => CARD_NAME_RE.test(item));
    if (!hasCardByConvention) {
      process.stdout.write(
        `Warning ${target.slug}: no *_card asset found; selected "${cardPath}" as temporary card.\n`,
      );
    }
    const generated = {
      slug: target.slug,
      folder: target.folder,
      media: {
        card: cardPath
          ? {
              type: mediaTypeFromPath(cardPath),
              src: cardPath,
            }
          : undefined,
        blocks: autoBlocks ? inferBlocks(files, cardPath) : [],
      },
      files,
    };

    const merged = mergeEntry(existingBySlug.get(target.slug), generated);
    mergedEntries.push(merged);
    process.stdout.write(`Indexed ${target.slug}: ${files.length} files.\n`);
  }

  const bySlug = new Map(mergedEntries.map((entry) => [entry.slug, entry]));
  const finalEntries = [...existingManifest]
    .filter((entry) => {
      const slug = toSlug(entry?.slug);
      return !bySlug.has(toPosix(entry?.slug)) && !excludedSlugs.has(slug);
    })
    .concat(mergedEntries)
    .sort((left, right) => toPosix(left.slug).localeCompare(toPosix(right.slug)));

  await writeFile(OUTPUT_PATH, `${JSON.stringify(finalEntries, null, 2)}\n`, "utf8");
  process.stdout.write(`Wrote ${finalEntries.length} entries to ${OUTPUT_PATH}.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
