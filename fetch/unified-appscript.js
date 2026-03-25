function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  syncBunnyMediaToSheet_(ss);

  const pagesRows = sheetToArray_(ss.getSheetByName("pages"));
  const tokenRows = sheetToArray_(ss.getSheetByName("type-tokens"));
  const fontRows = sheetToArray_(ss.getSheetByName("font-list"));
  const mediaRows = sheetToArray_(ss.getSheetByName("media"));
  const schemaRows = sheetToArray_(ss.getSheetByName("data"));

  const mediaIndex = buildMediaIndex_(mediaRows);

  const output = {
    schema_version: 3,
    generated_at: new Date().toISOString(),
    source: "apps-script",
    schema: buildSchema_(schemaRows),
    "type-tokens": tokenRows,
    "font-list": fontRows,
    pages: pagesRows.map((row) => transformPageRow_(row, mediaIndex)),
    media: mediaRows.filter((row) => !isPlaceholderFile_(row.file_name)),
  };

  return ContentService.createTextOutput(JSON.stringify(output, null, 2)).setMimeType(ContentService.MimeType.JSON);
}

function syncBunnyMediaToSheet_(ss) {
  const props = PropertiesService.getScriptProperties();
  const storageZoneName = mustGetProperty_(props, "BUNNY_STORAGE_ZONE");
  const storageAccessKey = mustGetProperty_(props, "BUNNY_STORAGE_ACCESS_KEY");
  const storageRegion = (props.getProperty("BUNNY_STORAGE_REGION") || "storage").toLowerCase();
  const publicBaseUrl = stripTrailingSlash_(mustGetProperty_(props, "BUNNY_PUBLIC_BASE_URL"));
  const devBaseUrl = stripTrailingSlash_(props.getProperty("BUNNY_DEV_BASE_URL") || "");
  const rootPath = normalizeRootPath_(props.getProperty("BUNNY_MEDIA_ROOT") || "/");
  const sheetName = props.getProperty("GOOGLE_SHEET_NAME") || "media";

  const endpointHost =
    storageRegion === "storage" ? "storage.bunnycdn.com" : storageRegion + ".storage.bunnycdn.com";

  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet "' + sheetName + '" not found.');
  }

  const files = listAllBunnyFiles_(endpointHost, storageZoneName, storageAccessKey, rootPath).filter(function(file) {
    return !isPlaceholderFile_(file.fileName);
  });

  files.sort(function(a, b) {
    return a.bunnyPath.localeCompare(b.bunnyPath);
  });

  const header = [
    "media_key",
    "bunny_path",
    "folder",
    "file_name",
    "public_url",
    "dev_url",
    "size_bytes",
    "last_changed"
  ];

  const rows = files.map(function(file) {
    return [
      file.mediaKey,
      file.bunnyPath,
      file.folder,
      file.fileName,
      joinUrl_(publicBaseUrl, file.bunnyPath),
      devBaseUrl ? joinUrl_(devBaseUrl, file.bunnyPath) : "",
      file.sizeBytes,
      file.lastChanged
    ];
  });

  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length).setValues([header]);

  if (rows.length) {
    sheet.getRange(2, 1, rows.length, header.length).setValues(rows);
  }
}

function sheetToArray_(sheet) {
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return [];

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(function(h) {
    return String(h || "").trim();
  });

  return values
    .slice(1)
    .filter(function(row) {
      return row.some(function(cell) {
        return cell !== "";
      });
    })
    .map(function(row) {
      const obj = {};
      headers.forEach(function(header, i) {
        if (header) obj[header] = row[i];
      });
      return obj;
    });
}

function buildSchema_(rows) {
  return {
    block_layouts: uniqueValues_(
      rows
        .map(function(r) {
          return asString_(r.block_layout);
        })
        .filter(Boolean)
    ),
    block_types: uniqueValues_(
      rows
        .map(function(r) {
          return asString_(r.block_type);
        })
        .filter(Boolean)
    )
  };
}

function buildMediaIndex_(rows) {
  const index = {
    byKey: {},
    byFolder: {}
  };

  rows.forEach(function(row) {
    const fileName = asString_(row.file_name);
    if (!fileName || isPlaceholderFile_(fileName)) {
      return;
    }

    const normalized = {
      media_key: asString_(row.media_key),
      bunny_path: asString_(row.bunny_path),
      folder: asString_(row.folder),
      file_name: fileName,
      public_url: asString_(row.public_url),
      dev_url: asString_(row.dev_url),
      size_bytes: row.size_bytes,
      last_changed: row.last_changed
    };

    [
      normalized.media_key,
      normalized.bunny_path,
      normalized.public_url,
      normalized.dev_url,
      normalized.file_name
    ]
      .filter(Boolean)
      .forEach(function(key) {
        index.byKey[key] = normalized;
      });

    if (!normalized.folder) {
      return;
    }

    if (!index.byFolder[normalized.folder]) {
      index.byFolder[normalized.folder] = [];
    }

    index.byFolder[normalized.folder].push(normalized);
  });

  Object.keys(index.byFolder).forEach(function(folder) {
    index.byFolder[folder].sort(function(a, b) {
      return naturalCompare_(a.file_name, b.file_name);
    });
  });

  return index;
}

function transformPageRow_(row, mediaIndex) {
  const page = {
    page: asString_(row.page),
    card_background: resolveMediaValue_(row.card_background, mediaIndex),
    title: asString_(row.title),
    button_text: asString_(row.button_text),
    project_copy: asString_(row.project_copy),
    blocks: []
  };

  for (let i = 1; i <= 15; i += 1) {
    const key = String(i).padStart(2, "0");
    const type = asString_(row["block" + key + "_type"]);
    const layout = asString_(row["block" + key + "_layout"]);
    const title = asString_(row["block" + key + "_title"]);
    const copy = asString_(row["block" + key + "_copy"]);
    const mediaValue = row["block" + key + "_media"];
    const thumbValue = row["block" + key + "_thumb"];

    if (!type && !layout && !title && !copy && isBlank_(mediaValue) && isBlank_(thumbValue)) {
      continue;
    }

    const media = buildBlockMedia_(mediaValue, thumbValue, mediaIndex, type);

    page.blocks.push({
      id: "block" + key,
      index: i,
      type: type,
      layout: layout,
      title: title,
      copy: copy,
      media: media
    });
  }

  return page;
}

function buildBlockMedia_(mediaValue, thumbValue, mediaIndex, blockType) {
  const mediaItems = expandMediaValue_(mediaValue, mediaIndex, blockType);
  const thumb = buildBlockThumb_(thumbValue, mediaIndex);

  if (!thumb) {
    return mediaItems;
  }

  if (typeof thumb === "number") {
    return mediaItems.map(function(item) {
      if (item.role === "video") {
        item.thumbnail_at = thumb;
      }
      return item;
    });
  }

  if (!mediaItems.length) {
    return [{ url: thumb, role: "poster" }];
  }

  const withPosters = [];
  mediaItems.forEach(function(item) {
    withPosters.push(item);
    if (item.role === "video" || item.role === "embed") {
      withPosters.push({ url: thumb, role: "poster" });
    }
  });

  return withPosters;
}

function expandMediaValue_(value, mediaIndex, blockType) {
  if (isBlank_(value)) return [];

  const text = asString_(value);
  const folderItems = mediaIndex.byFolder[text];
  if (folderItems && folderItems.length) {
    return folderItems.map(function(row) {
      const url = asString_(row.public_url) || asString_(row.dev_url);
      return {
        url: url,
        role: inferMediaRole_(url, blockType)
      };
    });
  }

  const resolved = resolveMediaValue_(text, mediaIndex);
  if (!resolved) return [];

  return [
    {
      url: resolved,
      role: inferMediaRole_(resolved, blockType)
    }
  ];
}

function buildBlockThumb_(value, mediaIndex) {
  if (isBlank_(value)) return "";

  if (typeof value === "number" && isFinite(value)) {
    return value;
  }

  const text = asString_(value);
  if (!text) return "";

  const numeric = Number(text);
  if (!Number.isNaN(numeric) && String(numeric) === text) {
    return numeric;
  }

  const folderItems = mediaIndex.byFolder[text];
  if (folderItems && folderItems.length) {
    const first = folderItems[0];
    return asString_(first.public_url) || asString_(first.dev_url) || "";
  }

  return resolveMediaValue_(text, mediaIndex);
}

function resolveMediaValue_(value, mediaIndex) {
  const text = asString_(value);
  if (!text) return "";

  if (looksLikeUrl_(text)) return text;

  const mediaRow = mediaIndex.byKey[text];
  if (!mediaRow) return text;

  return asString_(mediaRow.public_url) || asString_(mediaRow.dev_url) || text;
}

function inferMediaRole_(url, blockType) {
  const lower = String(url).toLowerCase();
  const normalizedType = asString_(blockType).toLowerCase();

  if (lower.includes("youtube.com") || lower.includes("youtu.be") || lower.includes("youtube-nocookie.com")) {
    return "embed";
  }

  if (normalizedType === "video_embed") {
    return "embed";
  }

  if (/\.(mp4|webm|mov|m4v|ogg|ogv)(\?|#|$)/i.test(lower)) {
    return "video";
  }

  return "image";
}

function listAllBunnyFiles_(endpointHost, storageZoneName, storageAccessKey, rootPath) {
  const queue = [rootPath];
  const files = [];
  const visited = {};

  while (queue.length) {
    const currentPath = normalizeRootPath_(queue.shift());

    if (visited[currentPath]) {
      continue;
    }
    visited[currentPath] = true;

    const items = listBunnyDirectory_(endpointHost, storageZoneName, storageAccessKey, currentPath);

    items.forEach(function(item) {
      const fullPath = joinBunnyPath_(currentPath, item.ObjectName);

      if (item.IsDirectory) {
        queue.push(fullPath);
        return;
      }

      files.push({
        mediaKey: fullPath.replace(/^\//, ""),
        bunnyPath: fullPath,
        folder: currentPath,
        fileName: item.ObjectName,
        sizeBytes: item.Length || 0,
        lastChanged: item.LastChanged || ""
      });
    });
  }

  return files;
}

function listBunnyDirectory_(endpointHost, storageZoneName, storageAccessKey, directoryPath) {
  const normalizedDirectory = normalizeRootPath_(directoryPath);
  const url =
    "https://" + endpointHost + "/" + encodeURIComponent(storageZoneName) + normalizeBrowsePath_(normalizedDirectory);

  const response = UrlFetchApp.fetch(url, {
    method: "get",
    muteHttpExceptions: true,
    headers: {
      AccessKey: storageAccessKey
    }
  });

  const code = response.getResponseCode();
  const text = response.getContentText();

  if (code < 200 || code >= 300) {
    throw new Error("Bunny list failed for " + normalizedDirectory + " (" + code + "): " + text);
  }

  const data = JSON.parse(text);
  if (!Array.isArray(data)) {
    throw new Error("Unexpected Bunny response for " + normalizedDirectory + ": " + text);
  }

  return data;
}

function joinBunnyPath_(folderPath, objectName) {
  const folder = normalizeRootPath_(folderPath || "/");
  if (folder === "/") {
    return "/" + objectName;
  }
  return folder + "/" + objectName;
}

function normalizeRootPath_(value) {
  if (!value) {
    return "/";
  }

  let normalized = String(value).trim().replace(/\\/g, "/");
  normalized = normalized.replace(/\/{2,}/g, "/");

  if (normalized.charAt(0) !== "/") {
    normalized = "/" + normalized;
  }

  if (normalized.length > 1 && normalized.charAt(normalized.length - 1) === "/") {
    normalized = normalized.slice(0, -1);
  }

  return normalized || "/";
}

function normalizeBrowsePath_(directoryPath) {
  const normalized = normalizeRootPath_(directoryPath);
  return normalized === "/" ? "/" : normalized + "/";
}

function stripTrailingSlash_(value) {
  return String(value || "").replace(/\/+$/, "");
}

function joinUrl_(baseUrl, bunnyPath) {
  return stripTrailingSlash_(baseUrl) + normalizeRootPath_(bunnyPath);
}

function uniqueValues_(values) {
  return Array.from(new Set(values));
}

function asString_(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function isBlank_(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function looksLikeUrl_(value) {
  return /^https?:\/\//i.test(value);
}

function isPlaceholderFile_(fileName) {
  return asString_(fileName) === ".bunnysync.keep";
}

function naturalCompare_(a, b) {
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

function mustGetProperty_(props, key) {
  const value = props.getProperty(key);
  if (!value) {
    throw new Error("Missing script property: " + key);
  }
  return value;
}
