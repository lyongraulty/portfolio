import { Container } from "@/components/Container";
import { ModalLink } from "@/components/ModalLink";

type ProjectCardProps = {
  slug: string;
  index: number;
  title: string;
  description: string;
  buttonText?: string;
  modal?: "project" | "project-page";
  page?: string;
  media?: {
    type: "video" | "image";
    src: string;
  };
};

function formatIndex(index: number) {
  return String(index).padStart(2, "0");
}

export function ProjectCard({
  slug,
  index,
  title,
  description,
  buttonText = "View Project",
  modal = "project",
  page,
  media,
}: ProjectCardProps) {
  return (
    <article className="project-card" data-hover-zone="project">
      {media ? (
        <div className="project-media" aria-hidden="true">
          {media.type === "video" ? (
            <video src={media.src} autoPlay muted loop playsInline preload="metadata" />
          ) : (
            <img src={media.src} alt="" />
          )}
        </div>
      ) : null}
      <Container className="project-card-inner">
        <h2 className="project-title">{title}</h2>
        <p className="project-action">
          <ModalLink className="project-button type-button" modal={modal} slug={slug} page={page}>
            {buttonText}
          </ModalLink>
        </p>
        <p className="project-index type-overline">{formatIndex(index)}.</p>
        <p className="project-divider type-overline">-</p>
        <p className="project-description type-caption">{description}</p>
      </Container>
    </article>
  );
}
