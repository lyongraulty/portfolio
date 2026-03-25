import { Section } from "@/components/Section";
import { ModalLink } from "@/components/ModalLink";

export function MusicSectionDark() {
  return (
    <Section size="large" fullBleed className="music-section-dark" data-tone="dark" aria-labelledby="music-dark-heading">
      <div className="music-dark-inner">
        <h2 id="music-dark-heading">MUSIC</h2>
        <p>
          <ModalLink className="project-button type-button" modal="music">
            View
          </ModalLink>
        </p>
        <p className="project-index type-overline">#.</p>
        <p className="project-divider type-overline">-</p>
        <p className="project-description type-caption">
          A sampling of my musical projects - complete with video, audio &amp; tour dates
        </p>
      </div>
    </Section>
  );
}
