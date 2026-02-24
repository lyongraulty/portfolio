import Link from "next/link";
import { Section } from "@/components/Section";

export function MusicSectionDark() {
  return (
    <Section size="large" fullBleed className="music-section-dark" data-tone="dark" aria-labelledby="music-dark-heading">
      <div className="music-dark-inner">
        <h2 id="music-dark-heading">MUSIC // MUSIC</h2>
        <p>
          <Link className="project-button" href="/music">
            View
          </Link>
        </p>
        <p className="project-index">#.</p>
        <p className="project-divider">-</p>
        <p className="project-description">
          A sampling of my musical projects - complete with video, audio &amp; tour dates
        </p>
      </div>
    </Section>
  );
}
