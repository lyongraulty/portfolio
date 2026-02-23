import { Section } from "@/components/Section";

export function HeroSection() {
  return (
    <Section id="intro" size="large" fullBleed className="hero-section" aria-labelledby="intro-heading">
      <div className="hero-media-wrap">
        <video className="hero-video" autoPlay muted loop playsInline aria-label="Autoplay reel placeholder" />
      </div>
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 id="intro-heading">LYON GRAULTY</h1>
          <p className="hero-subtitle">2D &amp; 3D MOTION DESIGNER</p>
          <a className="hero-inquiries-button" href="#contact">
            Inquiries
          </a>
        </div>
      </div>
    </Section>
  );
}
