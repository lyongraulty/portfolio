import Link from "next/link";
import { Section } from "@/components/Section";
import { workItems } from "@/lib/work";

export function WorkGrid() {
  return (
    <Section id="work" className="work-section">
      <header className="section-header">
        <p className="kicker">Selected Work</p>
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
              <Link href={`/work/${item.slug}`}>{item.title}</Link>
            </h3>
            <p>{item.summary}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
