import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const SITE_DATA_PATH = path.join(rootDir, "content", "site-data.json");
const PROJECTS_PATH = path.join(rootDir, "content", "projects.json");
const BUNNY_MEDIA_PATH = path.join(rootDir, "content", "bunny-media.json");
const ENV_FILE_PATH = path.join(rootDir, ".env.local");

function toText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function toNumber(value) {
  const parsed = Number(toText(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function inferMediaType(src, fallback = "image") {
  return /\.(mp4|webm|ogg|ogv|mov|m4v)(?:$|[?#])/i.test(src) ? "video" : fallback;
}

function splitCsv(value) {
  return toText(value)
    .split(",")
    .map((segment) => toText(segment).toLowerCase())
    .filter(Boolean);
}

function toSlug(value) {
  return toText(value).toLowerCase();
}

function toTitleFromSlug(slug) {
  return toText(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildOrderMapFromCsv(value) {
  const map = new Map();
  splitCsv(value).forEach((slug, index) => {
    map.set(slug, index);
  });
  return map;
}

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function readOptionalJson(filePath) {
  try {
    return await readJson(filePath);
  } catch {
    return null;
  }
}

async function loadEnvLocal() {
  let raw = "";
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

function normalizeMediaItem(item) {
  const src = toText(item?.src);
  if (!src) return null;

  const role = toText(item?.role).toLowerCase() || inferMediaType(src);
  const type = toText(item?.type).toLowerCase();
  const kind = type === "video" || type === "embed" ? type : inferMediaType(src);
  const thumbnailAt = toNumber(item?.thumbnailAt);

  return {
    role: role || kind,
    url: src,
    ...(thumbnailAt !== null && thumbnailAt >= 0 ? { thumbnail_at: thumbnailAt } : {}),
  };
}

function normalizeBlock(block, index) {
  const slot = toNumber(block?.slot) ?? index + 1;
  const title = toText(block?.title);
  const layout = toText(block?.layout) || "single";
  const copy = toText(block?.copy);
  const items = Array.isArray(block?.items) ? block.items.map(normalizeMediaItem).filter(Boolean) : [];

  return {
    id: `block${String(slot).padStart(2, "0")}`,
    index: slot,
    type: items.some((item) => item.role === "video" || item.role === "embed") ? "video" : "image",
    layout,
    title,
    copy,
    media: items,
  };
}

function buildDefaultBlocks(project) {
  const title = toText(project.title) || "PROJECT";
  const detail = toText(project.detail) || toText(project.summary);
  const category = toText(project.category);
  const year = toText(project.year);
  const mediaSrc = toText(project.media?.src);
  const mediaType = toText(project.media?.type).toLowerCase() || inferMediaType(mediaSrc);

  const blocks = [];

  if (mediaSrc) {
    blocks.push({
      id: "block01",
      index: 1,
      type: mediaType === "video" ? "video" : "image",
      layout: "single",
      title,
      copy: "",
      media: [{ role: mediaType, url: mediaSrc }],
    });
  }

  blocks.push({
    id: "block02",
    index: 2,
    type: "text",
    layout: "single",
    title: "Overview",
    copy: detail,
    media: [],
  });

  blocks.push({
    id: "block03",
    index: 3,
    type: "text",
    layout: "single",
    title: "Details",
    copy: [category, year].filter(Boolean).join(" / "),
    media: [],
  });

  return blocks;
}

function buildProjectPage(project, bunnyEntry, pageNumber) {
  const slug = toText(project.slug);
  const title = toText(project.title) || "PROJECT";
  const summary = toText(project.summary);
  const detail = toText(project.detail) || summary;
  const year = toText(project.year);
  const category = toText(project.category);
  const mediaSrc = toText(bunnyEntry?.media?.card?.src) || toText(project.media?.src);

  const mappedBlocks = Array.isArray(bunnyEntry?.media?.blocks)
    ? bunnyEntry.media.blocks.map((block, index) => normalizeBlock(block, index)).filter(Boolean)
    : [];

  const blocks = mappedBlocks.length > 0 ? mappedBlocks : buildDefaultBlocks(project);

  return {
    page: String(pageNumber),
    slug,
    title,
    year,
    category,
    button_text: "View Project",
    project_copy: summary || detail,
    card_background: mediaSrc,
    blocks,
  };
}

async function main() {
  await loadEnvLocal();

  const [siteData, projects, bunnyMedia] = await Promise.all([
    readJson(SITE_DATA_PATH),
    readJson(PROJECTS_PATH),
    readOptionalJson(BUNNY_MEDIA_PATH),
  ]);

  if (!Array.isArray(projects)) {
    throw new Error("content/projects.json must be an array.");
  }

  const excludedSlugs = new Set(splitCsv(process.env.BUNNY_EXCLUDED_SLUGS || "reel,sandbox,music"));
  const preferredOrder = buildOrderMapFromCsv(process.env.BUNNY_PROJECT_ORDER || "");

  const bunnyBySlug = new Map(
    (Array.isArray(bunnyMedia) ? bunnyMedia : [])
      .map((entry) => [toText(entry?.slug), entry])
      .filter(([slug]) => slug),
  );

  const projectBySlug = new Map(
    projects
      .map((project) => [toSlug(project?.slug), project])
      .filter(([slug]) => slug && !excludedSlugs.has(slug)),
  );

  for (const [slugRaw, bunnyEntry] of bunnyBySlug.entries()) {
    const slug = toSlug(slugRaw);
    if (!slug || excludedSlugs.has(slug) || projectBySlug.has(slug)) {
      continue;
    }

    const cardSrc = toText(bunnyEntry?.media?.card?.src);
    const inferredTitle = toTitleFromSlug(slug);
    projectBySlug.set(slug, {
      slug,
      title: inferredTitle || "Project",
      year: "",
      category: "",
      summary: "",
      detail: "",
      media: cardSrc
        ? {
            type: inferMediaType(cardSrc),
            src: cardSrc,
          }
        : undefined,
    });
  }

  const existingOrder = new Map(
    projects
      .map((project, index) => [toSlug(project?.slug), index])
      .filter(([slug]) => slug && !excludedSlugs.has(slug)),
  );

  const mergedProjects = [...projectBySlug.values()]
    .map((project) => {
      const bunnyEntry = bunnyBySlug.get(toText(project?.slug));
      const cardSrc = toText(bunnyEntry?.media?.card?.src);
      if (!cardSrc) {
        return project;
      }
      return {
        ...project,
        media: {
          type: inferMediaType(cardSrc),
          src: cardSrc,
        },
      };
    })
    .sort((left, right) => {
      const leftSlug = toSlug(left?.slug);
      const rightSlug = toSlug(right?.slug);
      const leftPreferred = preferredOrder.has(leftSlug) ? preferredOrder.get(leftSlug) : Number.MAX_SAFE_INTEGER;
      const rightPreferred = preferredOrder.has(rightSlug) ? preferredOrder.get(rightSlug) : Number.MAX_SAFE_INTEGER;
      if (leftPreferred !== rightPreferred) {
        return leftPreferred - rightPreferred;
      }

      const leftExisting = existingOrder.has(leftSlug) ? existingOrder.get(leftSlug) : Number.MAX_SAFE_INTEGER;
      const rightExisting = existingOrder.has(rightSlug) ? existingOrder.get(rightSlug) : Number.MAX_SAFE_INTEGER;
      if (leftExisting !== rightExisting) {
        return leftExisting - rightExisting;
      }

      return toText(left?.title || left?.slug).localeCompare(toText(right?.title || right?.slug), undefined, {
        numeric: true,
      });
    });

  const existingPages = Array.isArray(siteData.pages) ? siteData.pages : [];
  const reelPage = existingPages.find((page) => String(page?.page ?? "") === "1");

  const generatedProjectPages = mergedProjects.map((project, index) =>
    buildProjectPage(project, bunnyBySlug.get(toText(project?.slug)), index + 2),
  );

  const nextPages = [];
  if (reelPage) {
    nextPages.push(reelPage);
  }
  nextPages.push(...generatedProjectPages);

  const nextSiteData = {
    ...siteData,
    generated_at: new Date().toISOString(),
    pages: nextPages,
  };

  await writeFile(SITE_DATA_PATH, `${JSON.stringify(nextSiteData, null, 2)}\n`, "utf8");
  await writeFile(PROJECTS_PATH, `${JSON.stringify(mergedProjects, null, 2)}\n`, "utf8");
  process.stdout.write(
    `Synced ${generatedProjectPages.length} local project pages and ${mergedProjects.length} projects to content JSON.\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
