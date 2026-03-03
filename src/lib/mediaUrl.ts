const VIDEO_EXTENSION_RE = /\.(mp4|webm|ogg|ogv|mov|m4v)(?:$|[?#])/i;

function safeLower(value: string): string {
  return value.toLowerCase();
}

export function isLikelyVideoUrl(url: string): boolean {
  const value = url.trim();
  if (!value) {
    return false;
  }

  if (VIDEO_EXTENSION_RE.test(value)) {
    return true;
  }

  try {
    const parsed = new URL(value);
    const host = safeLower(parsed.hostname);
    const path = safeLower(parsed.pathname);

    if (VIDEO_EXTENSION_RE.test(path)) {
      return true;
    }

    if (host.endsWith("cloudinary.com") && path.includes("/video/upload/")) {
      return true;
    }
  } catch {
    return VIDEO_EXTENSION_RE.test(value);
  }

  return false;
}
