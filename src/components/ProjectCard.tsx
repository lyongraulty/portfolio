import Link from "next/link";
import { Container } from "@/components/Container";

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
          <Link className="project-button" href={`/work/${slug}`}>
            View Project
          </Link>
        </p>
        <p className="project-index">{formatIndex(index)}.</p>
        <p className="project-divider">-</p>
        <p className="project-description">{description}</p>
      </Container>
    </article>
  );
}
