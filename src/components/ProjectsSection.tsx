import { ProjectCard } from "@/components/ProjectCard";
import { Section } from "@/components/Section";
import { isLikelyVideoUrl } from "@/lib/mediaUrl";
import { workItems } from "@/lib/work";
import { getPages, type PageRow } from "../../fetch/getPages";

function toPageString(value: string | number | null | undefined): string {
  return typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);
}

function toPageNumber(value: string | number | null | undefined): number | null {
  const numeric = Number(toPageString(value).trim());
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return Math.floor(numeric);
}

function getFirstPageVideo(page: PageRow | null): string {
  if (!page) {
    return "";
  }

  for (let slot = 1; slot <= 8; slot += 1) {
    const key = `video-${String(slot).padStart(2, "0")}`;
    const compactKey = `video${String(slot).padStart(2, "0")}`;
    const value = toPageString(page[key] ?? page[compactKey]);
    if (value.trim().length > 0) {
      return value;
    }
  }

  return "";
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

export async function ProjectsSection() {
  const pages = await getPages();
  const pageTwo =
    pages.find((page) => toPageNumber(page.page) === 2) ??
    pages.find((page) => toPageString(page.page).trim() === "2") ??
    pages[1] ??
    null;
  const pageTitle = toPageString(pageTwo?.title).trim();
  const pageButtonText = toPageString(pageTwo?.["button-text"]).trim();
  const pageCopy = toPageString(pageTwo?.["project-copy"]).trim();
  const pageCardBackground = toPageString(
    pageTwo?.["card-background"] ?? pageTwo?.cardbackground ?? pageTwo?.["card-background-image"],
  ).trim();
  const pageFirstVideo = getFirstPageVideo(pageTwo);

  const youtubeThumb = pageFirstVideo ? toYouTubeThumb(pageFirstVideo) : null;
  const pageMedia = pageCardBackground.length > 0
    ? { type: (isLikelyVideoUrl(pageCardBackground) ? "video" : "image") as const, src: pageCardBackground }
    : youtubeThumb
      ? { type: "image" as const, src: youtubeThumb }
      : pageFirstVideo.length > 0
        ? { type: "video" as const, src: pageFirstVideo }
        : undefined;

  const hasPageTwoCard = !!(pageTitle || pageCopy || pageMedia);

  return (
    <Section id="projects" size="medium" fullBleed className="projects-section" data-tone="dark" aria-label="Projects">
      <div className="project-stack">
        {workItems.map((project, index) => {
          const displayIndex = hasPageTwoCard && index >= 1 ? index + 3 : index + 2;
          return [
              <ProjectCard
                key={project.slug}
                slug={project.slug}
                index={displayIndex}
                title={project.title}
                description={project.summary}
                media={project.media}
              />,
              index === 0 && hasPageTwoCard ? (
                <ProjectCard
                  key="page-two-live-project"
                  slug="page-two-live-project"
                  modal="project-page"
                  page="2"
                  index={3}
                  title={pageTitle || "PROJECT"}
                  description={pageCopy || "Live project loaded from page variables."}
                  buttonText={pageButtonText || "View Project"}
                  media={pageMedia}
                />
              ) : null,
            ];
        })}
      </div>
    </Section>
  );
}
