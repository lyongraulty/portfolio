import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Type Specimen",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TypeSpecimenPage() {
  return (
    <>
      <section className="section section--small">
        <div className="container" style={{ display: "grid", gap: "1.25rem" }}>
          <h2>Type Specimen</h2>
          <p className="type-caption">
            Unlisted internal page for validating live typography tokens.
          </p>

          <h1>HEADING 1</h1>
          <h2>HEADING 2</h2>
          <h3>HEADING 3</h3>
          <h4>HEADING 4</h4>

          <p>body body body body body body body body</p>
          <p className="type-body">type-body type-body type-body type-body</p>
          <p className="type-caption">type-caption type-caption type-caption type-caption</p>
          <p className="type-overline">type-overline type-overline type-overline</p>
          <p className="type-button">type-button type-button type-button</p>
          <p className="type-meta">type-meta type-meta type-meta</p>
          <p className="type-nav">type-nav type-nav type-nav</p>
        </div>
      </section>

      <section className="section section--small" data-tone="dark">
        <div className="container" style={{ display: "grid", gap: "1rem" }}>
          <p className="type-overline">Hero Override Sample</p>
          <div className="hero-overlay" style={{ minHeight: "auto" }}>
            <div className="hero-content">
              <h1>HERO H1 OVERRIDE</h1>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
