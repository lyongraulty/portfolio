import Link from "next/link";
import { Section } from "@/components/Section";

export function ReelSection() {
  return (
    <Section id="reel" size="medium" className="reel-section" aria-labelledby="reel-heading">
      <article className="reel-shell">
        <h2 id="reel-heading">MOTION REEL</h2>
        <p>
          <Link className="reel-button" href="/reel">
            View Reel
          </Link>
        </p>
        <p className="reel-index">01.</p>
        <p className="reel-divider">-</p>
        <p className="reel-description">A tightly edited compilation of recent work - both client and personal</p>
      </article>
    </Section>
  );
}
