import { Section } from "@/components/Section";

const pillars = [
  {
    title: "DESIGN",
    description:
      "From bold 2D motion graphics to immersive 3D worlds, I build out storyboards and styleframes that clarify the vision early - because the better the prep, the better the product. Every visual choice serves the story from the start.",
  },
  {
    title: "ANIMATE",
    description:
      "Animation is more than movement - it is communication. I deliver polished, purposeful motion that brings clarity and energy to the message, capturing attention and focusing it precisely where your story needs to be seen and understood.",
  },
  {
    title: "CONNECT",
    description:
      "From social promos to product launches, I craft work that reaches your audience and reinforces your brand. The goal is not just to look good - it is to build recognition, spark engagement, and move people to action.",
  },
];

export function AboutSection() {
  return (
    <Section size="medium" aria-label="About">
      <div className="about-grid">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="about-card">
            <h3>{pillar.title}</h3>
            <p>{pillar.description}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
