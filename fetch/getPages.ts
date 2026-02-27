import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

const PAGES_URL =
  "https://script.google.com/macros/s/AKfycbxFjryFYO9fo69JddLqAPGz5seQTyOLozK3Owhgw5f-9Ra3FZBG8MEGeg2RrLYPwMgT2w/exec";
const FALLBACK_PATH = path.join(process.cwd(), "fetch", "appscript.json");

export type PageRow = Record<string, string | number | null | undefined>;

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function sanitizeName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeRow(row: Record<string, unknown>): PageRow {
  const normalized: PageRow = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[sanitizeName(key)] = value as PageRow[string];
  }
  return normalized;
}

function parseRowsFromArray(items: unknown[]): PageRow[] {
  if (items.length === 0) {
    return [];
  }

  const first = items[0];
  if (isObject(first)) {
    return items.filter(isObject).map((row) => normalizeRow(row));
  }

  if (Array.isArray(first) && first.length > 0) {
    const headers = first.map((value) => sanitizeName(String(value)));
    return items
      .slice(1)
      .filter(Array.isArray)
      .map((row) => {
        const mapped: PageRow = {};
        headers.forEach((header, index) => {
          mapped[header] = row[index] as PageRow[string];
        });
        return mapped;
      });
  }

  return [];
}

function extractPages(data: unknown): PageRow[] {
  if (!isObject(data)) {
    return [];
  }

  const pages = data.pages;
  if (Array.isArray(pages)) {
    return parseRowsFromArray(pages);
  }

  return [];
}

async function readFallbackPages(): Promise<PageRow[]> {
  try {
    const raw = await readFile(FALLBACK_PATH, "utf8");
    const data = JSON.parse(raw) as unknown;
    return extractPages(data);
  } catch {
    return [];
  }
}

export async function getPages(): Promise<PageRow[]> {
  try {
    const response = await fetch(PAGES_URL, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return readFallbackPages();
    }

    const data = (await response.json()) as unknown;
    const pages = extractPages(data);
    if (pages.length > 0) {
      return pages;
    }
    return readFallbackPages();
  } catch {
    return readFallbackPages();
  }
}
