import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

const TOKENS_URL =
  "https://script.google.com/macros/s/AKfycbxFjryFYO9fo69JddLqAPGz5seQTyOLozK3Owhgw5f-9Ra3FZBG8MEGeg2RrLYPwMgT2w/exec";
const FALLBACK_PATH = path.join(process.cwd(), "fetch", "appscript.json");

export type TokenMap = Record<string, string | number>;
type TokenRow = Record<string, unknown>;
type JsonObject = Record<string, unknown>;

const SCHEMA_COLUMNS = new Set([
  "token",
  "font",
  "weight",
  "size-px",
  "style",
  "letter-spacing",
  "line-height",
  "text-transform",
  "color-light",
  "color-dark",
  "size-min-px",
  "size-max-px",
  "size-fluid-vw",
]);

const PX_COLUMNS = new Set(["size-px", "size-min-px", "size-max-px"]);

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function sanitizeName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizeRow(row: TokenRow): TokenRow {
  const normalized: TokenRow = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[sanitizeName(key)] = value;
  }
  return normalized;
}

function normalizeValue(column: string, value: unknown): string | number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const raw = String(value).trim();
  if (!raw) {
    return null;
  }

  const numeric = Number(raw);
  if (!Number.isNaN(numeric)) {
    if (column === "size-fluid-vw") {
      return `${numeric}vw`;
    }
    if (PX_COLUMNS.has(column)) {
      return `${numeric}px`;
    }
    return raw;
  }

  return raw;
}

function parseRowsFromArray(items: unknown[]): TokenRow[] {
  if (items.length === 0) {
    return [];
  }

  const first = items[0];
  if (isObject(first) && Object.keys(first).some((key) => sanitizeName(key) === "token")) {
    return items.filter(isObject) as TokenRow[];
  }

  if (Array.isArray(first) && first.length > 0) {
    const headers = first.map((value) => sanitizeName(String(value)));
    if (!headers.includes("token")) {
      return [];
    }

    return items
      .slice(1)
      .filter(Array.isArray)
      .map((row) => {
        const mapped: TokenRow = {};
        headers.forEach((header, index) => {
          mapped[header] = row[index];
        });
        return mapped;
      });
  }

  return [];
}

function extractTokenRows(data: unknown): TokenRow[] {
  if (Array.isArray(data)) {
    return parseRowsFromArray(data);
  }

  if (!isObject(data)) {
    return [];
  }

  const rowKeys = new Set(["rows", "data", "values", "tokens", "type-tokens", "typetokens"]);
  for (const [rawKey, candidate] of Object.entries(data)) {
    const key = sanitizeName(rawKey);
    if (!rowKeys.has(key)) {
      continue;
    }
    if (Array.isArray(candidate)) {
      const parsed = parseRowsFromArray(candidate);
      if (parsed.length > 0) {
        return parsed;
      }
    }
  }

  if (Array.isArray(data.columns) && Array.isArray(data.rows)) {
    const columns = data.columns.map((column) => sanitizeName(String(column)));
    if (columns.includes("token")) {
      return data.rows
        .filter(Array.isArray)
        .map((row) => {
          const mapped: TokenRow = {};
          columns.forEach((column, index) => {
            mapped[column] = row[index];
          });
          return mapped;
        });
    }
  }

  return [];
}

function toFlatTokenMap(data: JsonObject): TokenMap {
  const tokens: TokenMap = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || typeof value === "object") {
      continue;
    }
    tokens[key] = value;
  }

  return tokens;
}

function applyLegacyAliases(tokens: TokenMap, rowKey: string, row: TokenRow): void {
  const font = normalizeValue("font", row["font"]);
  const size = normalizeValue("size-px", row["size-px"]);
  const sizeMin = normalizeValue("size-min-px", row["size-min-px"]);
  const sizeMax = normalizeValue("size-max-px", row["size-max-px"]);
  const sizeFluid = normalizeValue("size-fluid-vw", row["size-fluid-vw"]);
  const color = normalizeValue("color-light", row["color-light"]);

  if (rowKey === "h1") {
    if (font) tokens["font-display"] = font;
    if (sizeMin) tokens["size-h1-min"] = sizeMin;
    if (sizeMax) tokens["size-h1-max"] = sizeMax;
    if (sizeMin && sizeFluid && sizeMax) {
      tokens["size-h1"] = `clamp(${sizeMin}, ${sizeFluid}, ${sizeMax})`;
    } else if (size) {
      tokens["size-h1"] = size;
    }
  }

  if (rowKey === "h2" && size) {
    tokens["size-h2"] = size;
  }

  if (rowKey === "body") {
    if (font) tokens["font-body"] = font;
    if (size) tokens["size-body"] = size;
    if (color) tokens["muted"] = color;
  }

  if (rowKey === "hero-h1-override") {
    if (sizeMin) tokens["size-hero-min"] = sizeMin;
    if (sizeMax) tokens["size-hero-max"] = sizeMax;
    if (sizeMin && sizeFluid && sizeMax) {
      tokens["size-hero"] = `clamp(${sizeMin}, ${sizeFluid}, ${sizeMax})`;
    } else if (size) {
      tokens["size-hero"] = size;
    }
  }
}

function rowsToTokenMap(rows: TokenRow[]): TokenMap {
  const tokens: TokenMap = {};
  let typeBodyFontFallback: string | number | null = null;
  let typeBodySizeFallback: string | number | null = null;
  let typeBodyColorFallback: string | number | null = null;
  let hasBodyToken = false;

  for (const rawRow of rows) {
    const row = normalizeRow(rawRow);
    const tokenName = sanitizeName(String(row["token"] ?? ""));
    if (!tokenName) {
      continue;
    }

    for (const [key, value] of Object.entries(row)) {
      const column = sanitizeName(key);
      if (!column || column === "token" || !SCHEMA_COLUMNS.has(column)) {
        continue;
      }
      const normalized = normalizeValue(column, value);
      if (normalized === null) {
        continue;
      }
      tokens[`${tokenName}-${column}`] = normalized;
    }

    if (tokenName === "body") {
      hasBodyToken = true;
    }

    if (tokenName === "type-body") {
      typeBodyFontFallback = normalizeValue("font", row["font"]);
      typeBodySizeFallback = normalizeValue("size-px", row["size-px"]);
      typeBodyColorFallback = normalizeValue("color-light", row["color-light"]);
    }

    applyLegacyAliases(tokens, tokenName, row);
  }

  if (!hasBodyToken) {
    if (typeBodyFontFallback) tokens["font-body"] = typeBodyFontFallback;
    if (typeBodySizeFallback) tokens["size-body"] = typeBodySizeFallback;
    if (typeBodyColorFallback) tokens["muted"] = typeBodyColorFallback;
  }

  return tokens;
}

async function parseTokens(data: unknown): Promise<TokenMap> {
  if (!data || typeof data !== "object") {
    return {};
  }

  const rows = extractTokenRows(data);
  if (rows.length > 0) {
    return rowsToTokenMap(rows);
  }

  if (isObject(data)) {
    return toFlatTokenMap(data);
  }

  return {};
}

async function readFallbackTokens(): Promise<TokenMap> {
  try {
    const raw = await readFile(FALLBACK_PATH, "utf8");
    const data = JSON.parse(raw) as unknown;
    return parseTokens(data);
  } catch {
    return {};
  }
}

export async function getTokens(): Promise<TokenMap> {
  try {
    const response = await fetch(TOKENS_URL, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return readFallbackTokens();
    }

    const data = (await response.json()) as unknown;

    const parsed = await parseTokens(data);
    if (Object.keys(parsed).length > 0) {
      return parsed;
    }
    return readFallbackTokens();
  } catch {
    return readFallbackTokens();
  }
}
