import { Section } from "@/components/Section";

export function Contact() {
  return (
    <Section id="contact">
      <header className="section-header">
        <p className="kicker type-overline">Contact</p>
        <h2>Let&apos;s build something useful</h2>
      </header>
      <p>Available for selected freelance and in-house collaborations.</p>
      <p>
        <a href="mailto:hello@example.com">hello@example.com</a>
      </p>
    </Section>
  );
}
