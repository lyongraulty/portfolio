import { ProjectCard } from "@/components/ProjectCard";
import { Section } from "@/components/Section";
import { isLikelyVideoUrl } from "@/lib/mediaUrl";
import { getPages, type PageRow } from "../../fetch/getPages";

function toPageString(value: unknown): string {
  return typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);
}

function toPageNumber(value: unknown): number | null {
  const numeric = Number(toPageString(value).trim());
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return Math.floor(numeric);
}

function toYouTubeThumb(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") {
      id = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (host.endsWith("youtube.com") || host === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") {
        id = parsed.searchParams.get("v") ?? "";
      } else if (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/shorts/")) {
        id = parsed.pathname.split("/")[2] ?? "";
      }
    }

    if (!id) {
      return null;
    }

    return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
  } catch {
    return null;
  }
}

function getPageCardMedia(page: PageRow): { type: "video" | "image"; src: string } | undefined {
  const cardBackground = toPageString(page["card-background"] ?? page.cardbackground ?? page["card-background-image"]).trim();
  if (cardBackground) {
    return {
      type: isLikelyVideoUrl(cardBackground) ? "video" : "image",
      src: cardBackground,
    };
  }

  if (!Array.isArray(page.blocks)) {
    return undefined;
  }

  const blocks = page.blocks.filter((block): block is Record<string, unknown> => !!block && typeof block === "object");
  const videoBlock =
    blocks.find((block) => {
      const type = toPageString(block.type).trim();
      return type === "video" || type === "video_embed";
    }) ?? null;

  if (!videoBlock || !Array.isArray(videoBlock.media)) {
    return undefined;
  }

  const media = videoBlock.media.filter((item): item is Record<string, unknown> => !!item && typeof item === "object");
  const poster =
    media.find((item) => {
      const role = toPageString(item.role).trim().toLowerCase();
      return role === "poster" || role === "image";
    }) ?? null;
  if (poster) {
    const posterUrl = toPageString(poster.url).trim();
    if (posterUrl) {
      return { type: "image", src: posterUrl };
    }
  }

  const primary =
    media.find((item) => {
      const role = toPageString(item.role).trim().toLowerCase();
      return role === "video" || role === "embed";
    }) ?? media[0];
  const primaryUrl = toPageString(primary?.url).trim();
  if (!primaryUrl) {
    return undefined;
  }

  const thumb = toYouTubeThumb(primaryUrl);
  if (thumb) {
    return { type: "image", src: thumb };
  }

  return isLikelyVideoUrl(primaryUrl) ? { type: "video", src: primaryUrl } : undefined;
}

function isRenderableProjectPage(page: PageRow): boolean {
  const title = toPageString(page.title).trim();
  const copy = toPageString(page["project-copy"]).trim();
  const media = getPageCardMedia(page);
  return !!(title || copy || media);
}

export async function ProjectsSection() {
  const pages = await getPages();
  const projectPages = pages
    .filter((page) => {
      const pageNumber = toPageNumber(page.page);
      return pageNumber !== null && pageNumber > 1;
    })
    .sort((a, b) => (toPageNumber(a.page) ?? Number.MAX_SAFE_INTEGER) - (toPageNumber(b.page) ?? Number.MAX_SAFE_INTEGER))
    .filter(isRenderableProjectPage);

  return (
    <Section id="projects" size="medium" fullBleed className="projects-section" data-tone="dark" aria-label="Projects">
      <div className="project-stack">
        {projectPages.map((page) => {
          const pageNumber = toPageNumber(page.page) ?? 0;
          const title = toPageString(page.title).trim() || "PROJECT";
          const description = toPageString(page["project-copy"]).trim() || "Live project loaded from page variables.";
          const buttonText = toPageString(page["button-text"]).trim() || "View Project";
          const media = getPageCardMedia(page);

          return (
            <ProjectCard
              key={`page-${pageNumber}`}
              slug={`page-${pageNumber}`}
              modal="project-page"
              page={String(pageNumber)}
              index={pageNumber}
              title={title}
              description={description}
              buttonText={buttonText}
              media={media}
            />
          );
        })}
      </div>
    </Section>
  );
}
