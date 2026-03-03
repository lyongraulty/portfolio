"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

type PageRow = Record<string, string | number | null | undefined>;

type Clip = {
  slot: number;
  video: string;
  thumb: string;
  copy: string;
};

function closeToPreviousOrHome(router: ReturnType<typeof useRouter>) {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}

function toText(value: string | number | null | undefined): string {
  return typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);
}

function normalizePages(data: unknown): PageRow[] {
  if (!data || typeof data !== "object") {
    return [];
  }
  const rawPages = (data as { pages?: unknown }).pages;
  if (!Array.isArray(rawPages)) {
    return [];
  }
  return rawPages.filter((entry) => entry && typeof entry === "object") as PageRow[];
}

function toYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    let videoId = "";

    if (host === "youtu.be") {
      videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (host.endsWith("youtube.com") || host === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v") ?? "";
      } else if (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/")[2] ?? "";
      }
    }

    if (!videoId) {
      return null;
    }

    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1`;
  } catch {
    return null;
  }
}

function buildClips(page: PageRow | null): Clip[] {
  if (!page) {
    return [];
  }

  const clips: Clip[] = [];
  for (let slot = 1; slot <= 8; slot += 1) {
    const key = String(slot).padStart(2, "0");
    const nonPadded = String(slot);

    const video = toText(
      page[`video-${key}`] ?? page[`video${key}`] ?? page[`video-${nonPadded}`] ?? page[`video${nonPadded}`],
    ).trim();
    const thumb = toText(
      page[`videothumb-${key}`] ??
        page[`videothumb${key}`] ??
        page[`video-${key}-thumb`] ??
        page[`videothumb-${nonPadded}`] ??
        page[`videothumb${nonPadded}`] ??
        page[`video-${nonPadded}-thumb`],
    ).trim();
    const copy = toText(page[`copy-${key}`] ?? page[`copy${key}`] ?? page[`copy-${nonPadded}`] ?? page[`copy${nonPadded}`]).trim();

    if (!video) {
      continue;
    }

    clips.push({ slot, video, thumb, copy });
  }

  return clips;
}

function isLikelyUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function parseTimecodeSeconds(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const asNumber = Number(trimmed);
  if (Number.isFinite(asNumber) && asNumber >= 0) {
    return asNumber;
  }

  const parts = trimmed.split(":").map((part) => Number(part));
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => !Number.isFinite(part) || part < 0)) {
    return null;
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function RandomVideoCover({ src, seekSeconds }: { src: string; seekSeconds?: number | null }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const onLoaded = () => {
      const duration = Number.isFinite(el.duration) ? el.duration : 0;
      if (typeof seekSeconds === "number" && Number.isFinite(seekSeconds) && seekSeconds >= 0) {
        const target = duration > 0 ? Math.min(seekSeconds, Math.max(0, duration - 0.1)) : seekSeconds;
        el.currentTime = target;
        return;
      }

      const max = Math.max(0.2, duration * 0.8);
      el.currentTime = Math.random() * max;
    };

    el.addEventListener("loadedmetadata", onLoaded);
    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [src, seekSeconds]);

  return <video ref={ref} src={src} className="reel-cover-preview" muted playsInline preload="metadata" />;
}

export function ProjectPageOverlayWindow({ pageId, onClose }: { pageId: string; onClose?: () => void }) {
  const router = useRouter();
  const [pageData, setPageData] = useState<PageRow | null>(null);
  const [startedSlots, setStartedSlots] = useState<Set<number>>(new Set());

  const defaultClose = useCallback(() => {
    closeToPreviousOrHome(router);
  }, [router]);
  const handleClose = onClose ?? defaultClose;

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const response = await fetch("/api/pages");
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as unknown;
        const pages = normalizePages(data);
        const selected = pages.find((page) => String(page.page ?? "") === pageId) ?? null;
        if (isMounted) {
          setPageData(selected);
        }
      } catch {
        // keep defaults if fetch fails
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [pageId]);

  const clips = useMemo(() => buildClips(pageData), [pageData]);
  const title = toText(pageData?.title).trim() || "PROJECT";
  const isProjectTwo = pageId.trim() === "2";

  useEffect(() => {
    setStartedSlots(new Set());
  }, [pageId, clips.length]);

  const closeOverlay = useCallback(() => {
    handleClose();
  }, [handleClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeOverlay();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeOverlay]);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeOverlay();
    }
  };

  const renderClipMedia = (clip: Clip) => {
    const started = startedSlots.has(clip.slot);
    const embed = toYouTubeEmbedUrl(clip.video);
    const thumbAsUrl = isLikelyUrl(clip.thumb) ? clip.thumb : "";
    const thumbAsTime = thumbAsUrl ? null : parseTimecodeSeconds(clip.thumb);

    if (started) {
      if (embed) {
        return (
          <iframe
            src={embed}
            className="reel-video"
            title={`${title} clip ${String(clip.slot).padStart(2, "0")}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        );
      }
      return <video src={clip.video} className="reel-video" preload="metadata" playsInline controls autoPlay />;
    }

    return (
      <button
        type="button"
        className="reel-cover-button"
        onClick={() => {
          setStartedSlots((prev) => {
            const next = new Set(prev);
            next.add(clip.slot);
            return next;
          });
        }}
        aria-label={`Play clip ${String(clip.slot).padStart(2, "0")}`}
      >
        {thumbAsUrl ? (
          <img src={thumbAsUrl} alt={`${title} thumbnail`} />
        ) : (
          <RandomVideoCover src={clip.video} seekSeconds={thumbAsTime} />
        )}
        <span className="reel-cover-play" aria-hidden="true" />
      </button>
    );
  };

  const primaryClip = isProjectTwo ? (clips[0] ?? null) : null;
  const remainingClips = isProjectTwo ? clips.slice(1) : clips;

  return (
    <div className="window-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={handleBackdropClick}>
      <div className="window-panel reel-window">
        <button type="button" className="window-close type-button" onClick={closeOverlay} aria-label="Close project" />
        {primaryClip ? (
          <div className="project-clip-block">
            <div className="reel-embed">{renderClipMedia(primaryClip)}</div>
          </div>
        ) : null}
        <h2 style={{ width: "100%" }}>{title}</h2>
        {primaryClip?.copy ? (
          <p className="reel-meta-list type-body" style={{ whiteSpace: "pre-line" }}>
            {primaryClip.copy}
          </p>
        ) : null}

        {remainingClips.map((clip) => {
          return (
            <div key={clip.slot} className="project-clip-block">
              <div className="reel-embed">{renderClipMedia(clip)}</div>
              {clip.copy ? (
                <p className="reel-meta-list type-body" style={{ whiteSpace: "pre-line" }}>
                  {clip.copy}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
