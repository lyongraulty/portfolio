import { Container } from "@/components/Container";

export function BitsSection() {
  return (
    <section id="bits" className="section section-compact" aria-labelledby="bits-heading">
      <Container className="centered-copy">
        <h2 id="bits-heading">Bits</h2>
        <p>Short experiments, process notes, and references will live here.</p>
      </Container>
    </section>
  );
}
