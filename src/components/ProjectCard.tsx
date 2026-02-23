import Link from "next/link";

type ProjectCardProps = {
  slug: string;
  index: number;
  title: string;
  description: string;
};

function formatIndex(index: number) {
  return String(index).padStart(2, "0");
}

export function ProjectCard({ slug, index, title, description }: ProjectCardProps) {
  return (
    <article className="project-card">
      <h3>{title}</h3>
      <p>
        <Link className="project-button" href={`/work/${slug}`}>
          View Project
        </Link>
      </p>
      <p className="project-index">{formatIndex(index)}.</p>
      <p className="project-divider">-</p>
      <p className="project-description">{description}</p>
    </article>
  );
}
