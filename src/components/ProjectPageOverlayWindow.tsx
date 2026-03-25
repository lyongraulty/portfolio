"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { getVideoMimeType, isLikelyVideoUrl, toCmsMediaUrl, toRenderableMediaUrl } from "@/lib/mediaUrl";
import { getPageBlocks, getPageTitle, toPageText } from "@/lib/pageData";

type PageRow = Record<string, unknown>;

type MediaItem = {
  url?: unknown;
  role?: unknown;
  thumbnail_at?: unknown;
  thumbnailAt?: unknown;
  thumb?: unknown;
  poster?: unknown;
};

type BlockItem = {
  index?: unknown;
  type?: unknown;
  title?: unknown;
  layout?: unknown;
  copy?: unknown;
  text?: unknown;
  body?: unknown;
  description?: unknown;
  media?: unknown;
  video?: unknown;
  url?: unknown;
  image?: unknown;
};

type ProjectBlock = {
  slot: number;
  title: string;
  layout: string;
  copy: string;
  media: Array<{ url: string; role: string; thumbnailAt?: number }>;
};

function normalizeLayout(value: unknown): string {
  return toPageText(value).trim().toLowerCase().replace(/\s+/g, "-");
}

function getBlockLayoutClass(layout: string, mediaCount: number): string | undefined {
  const normalized = normalizeLayout(layout);

  if (!normalized) {
    return mediaCount > 1 ? "project-media-grid layout-two-up" : undefined;
  }

  if (normalized === "single" || normalized === "one-up" || normalized === "full") {
    return "project-media-grid layout-single";
  }

  if (normalized === "two-up" || normalized === "2-up" || normalized === "2up" || normalized === "split") {
    return "project-media-grid layout-two-up";
  }

  if (normalized === "three-up" || normalized === "3-up" || normalized === "3up" || normalized === "triple") {
    return "project-media-grid layout-three-up";
  }

  if (
    normalized === "single" ||
    normalized === "two-column" ||
    normalized === "three-column" ||
    normalized === "grid" ||
    normalized === "carousel" ||
    normalized === "filmstrip" ||
    normalized === "masonry" ||
    normalized === "stack" ||
    normalized === "media-left" ||
    normalized === "media-right"
  ) {
    return `project-media-grid layout-${normalized}`;
  }

  return mediaCount > 1 ? "project-media-grid layout-two-up" : undefined;
}

function closeToPreviousOrHome(router: ReturnType<typeof useRouter>) {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
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

function toBlockSlot(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  const parsed = Number(toPageText(value).trim());
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }
  return fallback;
}

function normalizeBlockMedia(block: BlockItem): Array<{ url: string; role: string; thumbnailAt?: number }> {
  const mediaRaw = Array.isArray(block.media) ? block.media : [];
  const media = mediaRaw.filter((item): item is MediaItem => !!item && typeof item === "object");

  const fromMedia = media
    .map((item) => ({
      url: toCmsMediaUrl(item.url),
      role: toPageText(item.role).trim().toLowerCase(),
      thumbnailAt:
        typeof item.thumbnail_at === "number" && Number.isFinite(item.thumbnail_at) && item.thumbnail_at >= 0
          ? item.thumbnail_at
          : typeof item.thumbnailAt === "number" && Number.isFinite(item.thumbnailAt) && item.thumbnailAt >= 0
            ? item.thumbnailAt
            : undefined,
    }))
    .filter((item) => !!item.url)
    .map((item) => ({
      url: item.url,
      role: item.role || (isLikelyVideoUrl(item.url) ? "video" : "image"),
      thumbnailAt: item.thumbnailAt,
    }));

  if (fromMedia.length > 0) {
    return fromMedia;
  }

  const single = toCmsMediaUrl(block.video ?? block.url ?? block.image);
  if (!single) {
    return [];
  }

  return [{ url: single, role: isLikelyVideoUrl(single) ? "video" : "image", thumbnailAt: undefined }];
}

function isPlayableMedia(url: string, role: string): boolean {
  return role === "video" || role === "embed" || !!toYouTubeEmbedUrl(url) || isLikelyVideoUrl(url);
}

type RenderableMedia = {
  key: string;
  url: string;
  posterUrl: string;
  playable: boolean;
  thumbnailAt?: number;
};

function TimecodeVideoThumb({ src, seconds, title }: { src: string; seconds: number; title: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const renderSrc = toRenderableMediaUrl(src);
  const mime = getVideoMimeType(renderSrc);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const onLoaded = () => {
      const duration = Number.isFinite(el.duration) ? el.duration : 0;
      const target = duration > 0 ? Math.min(seconds, Math.max(0, duration - 0.1)) : seconds;
      el.currentTime = Math.max(0, target);
    };

    el.addEventListener("loadedmetadata", onLoaded);
    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [seconds, renderSrc]);

  return (
    <video ref={ref} className="project-media-video" preload="metadata" muted playsInline aria-label={title}>
      <source src={renderSrc} type={mime} />
    </video>
  );
}

function AutoPlayVideo({ src, posterUrl }: { src: string; posterUrl: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const renderSrc = toRenderableMediaUrl(src);
  const renderPoster = toRenderableMediaUrl(posterUrl);
  const mime = getVideoMimeType(renderSrc);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const tryPlay = async () => {
      try {
        await el.play();
      } catch {
        // If autoplay is blocked, controls remain available for manual start.
      }
    };

    void tryPlay();
  }, [renderSrc]);

  return (
    <video ref={ref} className="project-media-video" preload="metadata" playsInline controls autoPlay poster={renderPoster}>
      <source src={renderSrc} type={mime} />
    </video>
  );
}

function buildRenderableMedia(block: ProjectBlock): RenderableMedia[] {
  const posterIndices = block.media
    .map((item, index) => ({ role: item.role, index }))
    .filter((item) => item.role === "poster" || item.role === "thumb")
    .map((item) => item.index);
  const usedPosterIndices = new Set<number>();
  const renderables: RenderableMedia[] = [];

  block.media.forEach((item, index) => {
    const playable = isPlayableMedia(item.url, item.role);
    const isPosterOnly = item.role === "poster" || item.role === "thumb";
    if (isPosterOnly) {
      return;
    }

    let posterUrl = "";
    if (playable && posterIndices.length > 0) {
      const nextPoster = posterIndices.find((posterIndex) => posterIndex > index && !usedPosterIndices.has(posterIndex));
      const prevPoster =
        [...posterIndices].reverse().find((posterIndex) => posterIndex < index && !usedPosterIndices.has(posterIndex)) ?? null;
      const chosenPosterIndex = nextPoster ?? prevPoster ?? posterIndices.find((posterIndex) => !usedPosterIndices.has(posterIndex));
      if (typeof chosenPosterIndex === "number") {
        usedPosterIndices.add(chosenPosterIndex);
        posterUrl = block.media[chosenPosterIndex]?.url ?? "";
      }
    }

    renderables.push({
      key: `${block.slot}-${index}-${item.url}`,
      url: item.url,
      posterUrl,
      playable,
      thumbnailAt: item.thumbnailAt,
    });
  });

  return renderables;
}

function renderStartedMedia(url: string, title: string, posterUrl = "") {
  const embed = toYouTubeEmbedUrl(url);
  if (embed) {
    return (
      <iframe
        src={embed}
        className="project-media-iframe"
        title={`${title} media`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  if (isLikelyVideoUrl(url)) {
    return <AutoPlayVideo src={url} posterUrl={posterUrl} />;
  }

  return <img src={toRenderableMediaUrl(url)} className="project-media-image" alt={`${title} media`} />;
}

function renderMediaPreview(url: string, posterUrl: string, title: string, thumbnailAt?: number) {
  if (posterUrl) {
    return <img src={toRenderableMediaUrl(posterUrl)} className="project-media-image" alt={`${title} thumbnail`} />;
  }

  if (isLikelyVideoUrl(url)) {
    if (typeof thumbnailAt === "number" && Number.isFinite(thumbnailAt) && thumbnailAt >= 0) {
      return <TimecodeVideoThumb src={url} seconds={thumbnailAt} title={`${title} thumbnail`} />;
    }
    const renderSrc = toRenderableMediaUrl(url);
    const mime = getVideoMimeType(renderSrc);
    return (
      <video className="project-media-video" preload="metadata" muted playsInline>
        <source src={renderSrc} type={mime} />
      </video>
    );
  }

  return <img src={toRenderableMediaUrl(url)} className="project-media-image" alt={`${title} media`} />;
}

function renderMedia(url: string, title: string, posterUrl = "") {
  return renderStartedMedia(url, title, posterUrl);
}

function buildProjectBlocks(page: PageRow | null): ProjectBlock[] {
  if (!page) {
    return [];
  }

  const structuredBlocks = getPageBlocks(page);
  if (structuredBlocks.length > 0) {
    const blocks = structuredBlocks
      .filter((raw): raw is BlockItem => !!raw && typeof raw === "object")
      .map((block, i) => {
        const slot = toBlockSlot(block.index, i + 1);
        const title = toPageText(block.title).trim();
        const layout = normalizeLayout(block.layout);
        const copy = toPageText(block.copy ?? block.text ?? block.body ?? block.description).trim();
        const media = normalizeBlockMedia(block);
        return { slot, title, layout, copy, media } satisfies ProjectBlock;
      })
      .filter((block) => block.media.length > 0 || block.title.length > 0 || block.copy.length > 0)
      .sort((a, b) => a.slot - b.slot);

    if (blocks.length > 0) {
      return blocks;
    }
  }

  const legacyBlocks: ProjectBlock[] = [];
  for (let slot = 1; slot <= 8; slot += 1) {
    const key = String(slot).padStart(2, "0");
    const nonPadded = String(slot);

    const video = toCmsMediaUrl(
      page[`video-${key}`] ?? page[`video${key}`] ?? page[`video-${nonPadded}`] ?? page[`video${nonPadded}`],
    );
    const title = toPageText(
      page[`title-${key}`] ?? page[`title${key}`] ?? page[`title-${nonPadded}`] ?? page[`title${nonPadded}`],
    ).trim();
    const layout = normalizeLayout(
      page[`layout-${key}`] ?? page[`layout${key}`] ?? page[`layout-${nonPadded}`] ?? page[`layout${nonPadded}`],
    );
    const copy = toPageText(page[`copy-${key}`] ?? page[`copy${key}`] ?? page[`copy-${nonPadded}`] ?? page[`copy${nonPadded}`]).trim();

    if (!video && !title && !copy) {
      continue;
    }

    legacyBlocks.push({
      slot,
      title,
      layout,
      copy,
      media: video ? [{ url: video, role: "video" }] : [],
    });
  }

  return legacyBlocks;
}

export function ProjectPageOverlayWindow({ pageId, onClose }: { pageId: string; onClose?: () => void }) {
  const router = useRouter();
  const [pageData, setPageData] = useState<PageRow | null>(null);
  const [startedMedia, setStartedMedia] = useState<Set<string>>(new Set());
  const [carouselIndexBySlot, setCarouselIndexBySlot] = useState<Record<number, number>>({});

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
  }, [pageId, setPageData]);

  const blocks = useMemo(() => buildProjectBlocks(pageData), [pageData]);
  const title = getPageTitle(pageData) || "PROJECT";
  useEffect(() => {
    setStartedMedia(new Set());
    setCarouselIndexBySlot({});
  }, [pageId]);

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

  return (
    <div className="window-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={handleBackdropClick}>
      <div className="window-panel reel-window">
        <button type="button" className="window-close type-button" onClick={closeOverlay} aria-label="Close project" />
        <h2 style={{ width: "100%" }}>{title}</h2>

        {blocks.map((block) => (
          <div
            key={`${block.slot}-${block.title.slice(0, 12)}-${block.copy.slice(0, 12)}`}
            className={`project-clip-block${block.layout ? ` layout-${block.layout}` : ""}`}
          >
            {(() => {
              const sameAsModalTitle = block.title.trim().toLowerCase() === title.trim().toLowerCase();
              const hideAsRedundant = block.slot === 1 && sameAsModalTitle;
              return block.title && !hideAsRedundant ? <h3 className="project-block-title">{block.title}</h3> : null;
            })()}
            <div className="project-block-content">
              {block.media.length > 0 ? (() => {
              const renderables = buildRenderableMedia(block);
              const normalizedLayout = normalizeLayout(block.layout);
              if (normalizedLayout === "carousel" && renderables.length > 0) {
                const activeIndexRaw = carouselIndexBySlot[block.slot] ?? 0;
                const activeIndex = Math.min(Math.max(activeIndexRaw, 0), renderables.length - 1);
                const activeItem = renderables[activeIndex];
                const label = `${title} block ${String(block.slot).padStart(2, "0")}`;
                const started = startedMedia.has(activeItem.key);

                const shiftCarousel = (delta: number) => {
                  setCarouselIndexBySlot((prev) => {
                    const current = prev[block.slot] ?? 0;
                    const next = (current + delta + renderables.length) % renderables.length;
                    return { ...prev, [block.slot]: next };
                  });
                };

                return (
                  <div className="project-carousel">
                    <div className="project-media-frame">
                      {activeItem.playable ? (
                        started ? (
                          renderMedia(activeItem.url, label, activeItem.posterUrl)
                        ) : (
                          <button
                            type="button"
                            className="reel-cover-button"
                            onClick={() => {
                              setStartedMedia((prev) => {
                                const next = new Set(prev);
                                next.add(activeItem.key);
                                return next;
                              });
                            }}
                            aria-label={`Play ${label}`}
                          >
                            {renderMediaPreview(activeItem.url, activeItem.posterUrl, label, activeItem.thumbnailAt)}
                            <span className="reel-cover-play" aria-hidden="true" />
                          </button>
                        )
                      ) : (
                        renderMediaPreview(activeItem.url, "", label, activeItem.thumbnailAt)
                      )}
                    </div>
                    {renderables.length > 1 ? (
                      <>
                        <button
                          type="button"
                          className="project-carousel-nav is-prev"
                          onClick={() => shiftCarousel(-1)}
                          aria-label="Previous media"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="project-carousel-nav is-next"
                          onClick={() => shiftCarousel(1)}
                          aria-label="Next media"
                        >
                          ›
                        </button>
                      </>
                    ) : null}
                  </div>
                );
              }

              return (
                <div className={getBlockLayoutClass(block.layout, renderables.length)}>
                  {renderables.map((item) => {
                    const label = `${title} block ${String(block.slot).padStart(2, "0")}`;
                    const started = startedMedia.has(item.key);
                    return (
                      <div key={item.key} className="project-media-frame">
                        {item.playable ? (
                          started ? (
                            renderMedia(item.url, label, item.posterUrl)
                          ) : (
                            <button
                              type="button"
                              className="reel-cover-button"
                              onClick={() => {
                                setStartedMedia((prev) => {
                                  const next = new Set(prev);
                                  next.add(item.key);
                                  return next;
                                });
                              }}
                              aria-label={`Play ${label}`}
                            >
                          {renderMediaPreview(item.url, item.posterUrl, label, item.thumbnailAt)}
                          <span className="reel-cover-play" aria-hidden="true" />
                        </button>
                      )
                    ) : (
                      renderMediaPreview(item.url, "", label, item.thumbnailAt)
                    )}
                  </div>
                );
                  })}
                </div>
              );
              })() : null}
              {block.copy ? (
                <p className="reel-meta-list type-body project-block-copy" style={{ whiteSpace: "pre-line" }}>
                  {block.copy}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
