import { ProjectCard } from "@/components/ProjectCard";
import { Section } from "@/components/Section";
import { workItems } from "@/lib/work";

export function ProjectsSection() {
  return (
    <Section id="projects" size="medium" fullBleed className="projects-section" data-tone="dark" aria-label="Projects">
      <div className="project-stack">
        {workItems.map((project, index) => (
          <ProjectCard
            key={project.slug}
            slug={project.slug}
            index={index + 2}
            title={project.title}
            description={project.summary}
            media={project.media}
          />
        ))}
      </div>
    </Section>
  );
}
