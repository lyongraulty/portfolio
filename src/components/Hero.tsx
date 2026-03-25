import { Container } from "@/components/Container";
import { Section } from "@/components/Section";

export function Hero() {
  return (
    <Section fullBleed className="hero">
      <Container>
        <p className="kicker type-overline">Portfolio</p>
        <h1>Designing focused digital products with clear systems.</h1>
        <p>
          I help teams shape brand, product, and web experiences that are easy to navigate and built to grow.
        </p>
      </Container>
    </Section>
  );
}
