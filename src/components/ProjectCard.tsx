import { Container } from "@/components/Container";
import { ModalLink } from "@/components/ModalLink";

type ProjectCardProps = {
  slug: string;
  index: number;
  title: string;
  description: string;
  media?: {
    type: "video" | "image";
    src: string;
  };
};

function formatIndex(index: number) {
  return String(index).padStart(2, "0");
}

export function ProjectCard({ slug, index, title, description, media }: ProjectCardProps) {
  return (
    <article className="project-card" data-hover-zone="project">
      {media ? (
        <div className="project-media" aria-hidden="true">
          {media.type === "video" ? (
            <video autoPlay muted loop playsInline preload="metadata">
              <source src={media.src} type="video/mp4" />
            </video>
          ) : (
            <img src={media.src} alt="" />
          )}
        </div>
      ) : null}
      <Container className="project-card-inner">
        <h3>{title}</h3>
        <p>
          <ModalLink className="project-button type-button" modal="project" slug={slug}>
            View Project
          </ModalLink>
        </p>
        <p className="project-index type-overline">{formatIndex(index)}.</p>
        <p className="project-divider type-overline">-</p>
        <p className="project-description type-caption">{description}</p>
      </Container>
    </article>
  );
}
