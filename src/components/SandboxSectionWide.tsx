import { Section } from "@/components/Section";
import { ModalLink } from "@/components/ModalLink";

export function SandboxSectionWide() {
  return (
    <Section size="large" fullBleed className="sandbox-section" aria-labelledby="sandbox-heading">
      <div className="sandbox-inner">
        <h2 id="sandbox-heading">SANDBOX</h2>
        <p>
          <ModalLink className="project-button type-button button-invert" modal="sandbox">
            View
          </ModalLink>
        </p>
        <p className="project-index type-overline">11.</p>
        <p className="project-divider type-overline">-</p>
        <p className="project-description">Process, experimentation and other odds &amp; ends</p>
      </div>
    </Section>
  );
}
