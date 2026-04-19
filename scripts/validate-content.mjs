import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const siteDataPath = path.join(rootDir, "content", "site-data.json");
const projectsPath = path.join(rootDir, "content", "projects.json");

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

function asText(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function validateSiteData(data) {
  if (!isObject(data)) {
    fail("content/site-data.json must be a JSON object.");
    return;
  }

  if (!Array.isArray(data["type-tokens"])) {
    fail("content/site-data.json must include an array at key \"type-tokens\".");
  }

  if (!Array.isArray(data["font-list"])) {
    fail("content/site-data.json must include an array at key \"font-list\".");
  }

  if (!Array.isArray(data.pages)) {
    fail("content/site-data.json must include an array at key \"pages\".");
    return;
  }

  const seenPages = new Set();
  data.pages.forEach((page, index) => {
    if (!isObject(page)) {
      fail(`pages[${index}] must be an object.`);
      return;
    }

    const pageId = asText(page.page);
    if (!pageId) {
      fail(`pages[${index}] is missing a page id.`);
    } else if (seenPages.has(pageId)) {
      fail(`Duplicate page id "${pageId}" in pages.`);
    } else {
      seenPages.add(pageId);
    }

    if (!asText(page.title)) {
      fail(`pages[${index}] is missing title.`);
    }

    if (page.blocks !== undefined && !Array.isArray(page.blocks)) {
      fail(`pages[${index}].blocks must be an array when present.`);
    }
  });

  const colossalPage = data.pages.find((page) => asText(page?.slug).toLowerCase() === "colossal");
  if (colossalPage) {
    const requiredRoles = [
      "main_thumb",
      "step_01",
      "step_02_03",
      "step_04",
      "step_05_07",
      "step_08",
      "yellowstone_aru",
      "yellowstone_map",
      "yellowstone_master",
    ];

    const roles = new Set();
    const blocks = Array.isArray(colossalPage.blocks) ? colossalPage.blocks : [];
    blocks.forEach((block) => {
      const media = Array.isArray(block?.media) ? block.media : [];
      media.forEach((item) => {
        const role = asText(item?.role).toLowerCase();
        if (role) {
          roles.add(role);
        }
      });
    });

    if (!asText(colossalPage.card_background)) {
      fail("colossal page is missing card_background.");
    }

    const missingRoles = requiredRoles.filter((role) => !roles.has(role));
    if (missingRoles.length > 0) {
      fail(`colossal page is missing required media roles: ${missingRoles.join(", ")}.`);
    }
  }
}

function validateProjects(data) {
  if (!Array.isArray(data)) {
    fail("content/projects.json must be an array.");
    return;
  }

  const seenSlugs = new Set();
  data.forEach((project, index) => {
    if (!isObject(project)) {
      fail(`projects[${index}] must be an object.`);
      return;
    }

    const slug = asText(project.slug);
    if (!slug) {
      fail(`projects[${index}] is missing slug.`);
    } else if (seenSlugs.has(slug)) {
      fail(`Duplicate project slug "${slug}".`);
    } else {
      seenSlugs.add(slug);
    }

    if (!asText(project.title)) {
      fail(`projects[${index}] is missing title.`);
    }
  });
}

async function main() {
  const [siteData, projects] = await Promise.all([readJson(siteDataPath), readJson(projectsPath)]);
  validateSiteData(siteData);
  validateProjects(projects);

  if (process.exitCode && process.exitCode !== 0) {
    return;
  }

  process.stdout.write("Content validation passed.\n");
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
