import { Section } from "@/components/Section";
import { ModalLink } from "@/components/ModalLink";

export function ReelSection() {
  return (
    <Section
      id="reel"
      size="medium"
      className="reel-section"
      data-tone="dark"
      data-hover-zone="reel"
      aria-labelledby="reel-heading"
    >
      <article className="reel-shell">
        <h2 id="reel-heading">MOTION REEL</h2>
        <p className="reel-action">
          <ModalLink className="reel-button type-button" modal="reel">
            View Reel
          </ModalLink>
        </p>
        <p className="reel-index type-overline">01.</p>
        <p className="reel-divider type-overline">-</p>
        <p className="reel-description type-caption">
          A tightly edited compilation of recent work - both client and personal
        </p>
      </article>
    </Section>
  );
}
