import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const DEFAULT_BUNNY_INDEX_PATH = path.join(rootDir, "content", "bunny-media.json");
const EXAMPLE_BUNNY_INDEX_PATH = path.join(rootDir, "content", "bunny-media.example.json");
const OUTPUT_PROJECTS_PATH = path.join(rootDir, "content", "projects.json");
const OUTPUT_PAGES_PATH = path.join(rootDir, "content", "pages.generated.json");

function sanitizeName(name) {
  return String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function slugify(value) {
  return sanitizeName(value);
}

function toText(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function toNumber(value) {
  const parsed = Number(toText(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function inferMediaType(src, fallback = "image") {
  return /\.(mp4|webm|ogg|ogv|mov|m4v)(?:$|[?#])/i.test(src) ? "video" : fallback;
}

function normalizeMediaItem(item) {
  const src = toText(item?.src);
  if (!src) {
    return null;
  }

  return {
    role: toText(item?.role) || "image",
    type: toText(item?.type) === "video" ? "video" : inferMediaType(src),
    src,
    thumbnailAt: typeof item?.thumbnailAt === "number" ? item.thumbnailAt : undefined,
  };
}

function normalizeBlock(block, index) {
  const items = Array.isArray(block?.items) ? block.items.map(normalizeMediaItem).filter(Boolean) : [];
  return {
    slot: toNumber(block?.slot) ?? index + 1,
    layout: toText(block?.layout) || "",
    title: toText(block?.title),
    copy: toText(block?.copy),
    items,
  };
}

function normalizeBunnyEntry(entry) {
  const slug = slugify(entry?.slug || entry?.folder || entry?.title);
  if (!slug) {
    return null;
  }

  const cardSrc = toText(entry?.media?.card?.src);
  const blocks = Array.isArray(entry?.media?.blocks) ? entry.media.blocks.map(normalizeBlock).filter(Boolean) : [];

  return {
    slug,
    folder: toText(entry?.folder),
    page: toNumber(entry?.page),
    media: {
      card: cardSrc
        ? {
            type: toText(entry?.media?.card?.type) === "video" ? "video" : inferMediaType(cardSrc),
            src: cardSrc,
          }
        : undefined,
      blocks,
    },
  };
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

function normalizeSheetRows(data) {
  if (!data || typeof data !== "object") {
    return [];
  }

  if (Array.isArray(data.pages)) {
    return data.pages.map((row) => normalizeSheetRow(row)).filter(Boolean);
  }

  if (Array.isArray(data.projects)) {
    return data.projects.map((row) => normalizeSheetRow(row)).filter(Boolean);
  }

  return [];
}

function normalizeSheetRow(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return null;
  }

  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[sanitizeName(key)] = value;
  }

  const title = toText(normalized.title);
  const slug = slugify(normalized.slug || normalized["project-slug"] || normalized["folder-slug"] || title);
  const page = toNumber(normalized.page);

  return {
    raw: normalized,
    slug,
    page,
    title,
    year: toText(normalized.year),
    category: toText(normalized.category),
    summary: toText(normalized.summary || normalized["project-copy"] || normalized.description),
    detail: toText(normalized.detail || normalized["project-detail"] || normalized.summary || normalized["project-copy"]),
    buttonText: toText(normalized["button-text"] || normalized.button_text || normalized.cta),
    order: toNumber(normalized.order),
  };
}

async function fetchSheetData() {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) {
    throw new Error("Missing GOOGLE_SCRIPT_URL in environment.");
  }

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Sheet request failed with ${response.status}.`);
  }

  return response.json();
}

function mergeProject(sheetRow, bunnyEntry) {
  const title = sheetRow?.title || slugify(bunnyEntry.slug).replace(/-/g, " ");
  const summary = sheetRow?.summary || sheetRow?.detail || "";
  const detail = sheetRow?.detail || summary;

  return {
    slug: bunnyEntry.slug,
    title,
    year: sheetRow?.year || "",
    category: sheetRow?.category || "",
    summary,
    detail,
    media: bunnyEntry.media.card,
  };
}

function buildPagePayload(sheetRow, bunnyEntry, project) {
  const blocks = bunnyEntry.media.blocks.map((block) => ({
    index: block.slot,
    layout: block.layout,
    title: block.title,
    copy: block.copy,
    media: block.items.map((item) => ({
      role: item.role,
      url: item.src,
      kind: item.type,
      ...(typeof item.thumbnailAt === "number" ? { thumbnail_at: item.thumbnailAt } : {}),
    })),
  }));

  return {
    page: sheetRow?.page ?? bunnyEntry.page ?? null,
    slug: bunnyEntry.slug,
    title: project.title,
    year: project.year,
    category: project.category,
    summary: project.summary,
    detail: project.detail,
    button_text: sheetRow?.buttonText || "View Project",
    project_copy: project.summary,
    card_background: project.media?.src || "",
    blocks,
  };
}

function sortProjects(projects, pageMap) {
  return [...projects].sort((left, right) => {
    const leftOrder = pageMap.get(left.slug)?.page ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = pageMap.get(right.slug)?.page ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.title.localeCompare(right.title);
  });
}

async function ensureParent(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function main() {
  const bunnyJson = await readOptionalJson(DEFAULT_BUNNY_INDEX_PATH);
  if (!bunnyJson) {
    throw new Error(
      `Missing Bunny media index at ${DEFAULT_BUNNY_INDEX_PATH}. Copy ${EXAMPLE_BUNNY_INDEX_PATH} and adapt it to your folders.`,
    );
  }

  const bunnyEntries = Array.isArray(bunnyJson) ? bunnyJson.map(normalizeBunnyEntry).filter(Boolean) : [];
  if (bunnyEntries.length === 0) {
    throw new Error("Bunny media index is empty or invalid.");
  }

  const sheetData = await fetchSheetData();
  const sheetRows = normalizeSheetRows(sheetData);

  const sheetBySlug = new Map(sheetRows.filter((row) => row.slug).map((row) => [row.slug, row]));
  const projects = [];
  const pages = [];

  for (const bunnyEntry of bunnyEntries) {
    const sheetRow = sheetBySlug.get(bunnyEntry.slug) ?? null;
    const project = mergeProject(sheetRow, bunnyEntry);
    projects.push(project);
    pages.push(buildPagePayload(sheetRow, bunnyEntry, project));
  }

  const sortedProjects = sortProjects(projects, sheetBySlug);
  const sortedPages = [...pages].sort((left, right) => {
    const leftPage = typeof left.page === "number" ? left.page : Number.MAX_SAFE_INTEGER;
    const rightPage = typeof right.page === "number" ? right.page : Number.MAX_SAFE_INTEGER;
    return leftPage - rightPage;
  });

  await ensureParent(OUTPUT_PROJECTS_PATH);
  await writeFile(OUTPUT_PROJECTS_PATH, `${JSON.stringify(sortedProjects, null, 2)}\n`, "utf8");
  await writeFile(OUTPUT_PAGES_PATH, `${JSON.stringify({ pages: sortedPages }, null, 2)}\n`, "utf8");

  process.stdout.write(
    `Synced ${sortedProjects.length} projects to ${OUTPUT_PROJECTS_PATH} and ${OUTPUT_PAGES_PATH}.\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
