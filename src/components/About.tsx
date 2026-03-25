import { Section } from "@/components/Section";

export function About() {
  return (
    <Section id="about">
      <header className="section-header">
        <p className="kicker type-overline">About</p>
        <h2>Built for clarity</h2>
      </header>
      <p>
        I am a product designer and front-end collaborator focused on translating strategy into practical interfaces.
        My work balances typography, layout, and systems thinking so teams can ship confidently.
      </p>
    </Section>
  );
}
