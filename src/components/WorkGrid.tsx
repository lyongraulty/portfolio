import { Section } from "@/components/Section";
import { ModalLink } from "@/components/ModalLink";
import { workItems } from "@/lib/work";

export function WorkGrid() {
  return (
    <Section id="projects" className="work-section">
      <header className="section-header">
        <p className="kicker">Selected Projects</p>
        <h2>Recent projects</h2>
      </header>
      <div className="work-grid">
        {workItems.map((item) => (
          <article key={item.slug} className="work-card">
            <p className="work-meta">
              <span>{item.year}</span>
              <span>{item.category}</span>
            </p>
            <h3>
              <ModalLink modal="project" slug={item.slug}>
                {item.title}
              </ModalLink>
            </h3>
            <p>{item.summary}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
