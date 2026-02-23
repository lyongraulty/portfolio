import { ProjectCard } from "@/components/ProjectCard";
import { Section } from "@/components/Section";
import { workItems } from "@/lib/work";

export function ProjectsSection() {
  return (
    <Section id="projects" size="large" aria-label="Projects">
      <div className="project-stack">
        {workItems.map((project, index) => (
          <ProjectCard
            key={project.slug}
            slug={project.slug}
            index={index + 2}
            title={project.title}
            description={project.summary}
          />
        ))}
      </div>
    </Section>
  );
}
