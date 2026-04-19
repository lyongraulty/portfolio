import { ProjectCard } from "@/components/ProjectCard";
import { Section } from "@/components/Section";
import { getCardMediaFromBackground, getPageButtonText, getPageProjectCopy, getPageTitle, toPageNumber, REEL_PAGE_ID } from "@/lib/pageData";
import { getPages, type PageRow } from "../../fetch/getPages";

function isRenderableProjectPage(page: PageRow): boolean {
  const title = getPageTitle(page);
  const copy = getPageProjectCopy(page);
  const media = getCardMediaFromBackground(page);
  return !!(title || copy || media);
}

export async function ProjectsSection() {
  const pages = await getPages();
  const projectPages = pages
    .filter((page) => {
      const pageNumber = toPageNumber(page.page);
      return pageNumber !== null && pageNumber > REEL_PAGE_ID;
    })
    .sort((a, b) => (toPageNumber(a.page) ?? Number.MAX_SAFE_INTEGER) - (toPageNumber(b.page) ?? Number.MAX_SAFE_INTEGER))
    .filter(isRenderableProjectPage);

  return (
    <Section id="projects" size="medium" fullBleed className="projects-section" data-tone="dark" aria-label="Projects">
      <div className="project-stack">
        {projectPages.map((page) => {
          const pageNumber = toPageNumber(page.page) ?? 0;
          const title = getPageTitle(page) || "PROJECT";
          const description = getPageProjectCopy(page) || "Live project loaded from page variables.";
          const buttonText = getPageButtonText(page) || "View Project";
          const media = getCardMediaFromBackground(page);

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
