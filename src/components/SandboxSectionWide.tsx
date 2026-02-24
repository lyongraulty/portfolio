import Link from "next/link";
import { Section } from "@/components/Section";

export function SandboxSectionWide() {
  return (
    <Section size="large" fullBleed className="sandbox-section" aria-labelledby="sandbox-heading">
      <div className="sandbox-inner">
        <h2 id="sandbox-heading">SANDBOX</h2>
        <p>
          <Link className="project-button" href="/sandbox">
            View
          </Link>
        </p>
        <p className="project-index">11.</p>
        <p className="project-divider">-</p>
        <p className="project-description">Process, experimentation and other odds &amp; ends</p>
      </div>
    </Section>
  );
}
