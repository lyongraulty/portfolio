import { Section } from "@/components/Section";
import { ModalLink } from "@/components/ModalLink";

export function HeroSection() {
  return (
    <Section id="intro" size="large" fullBleed className="hero-section" data-tone="dark" aria-labelledby="intro-heading">
      <div className="hero-media-wrap">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Autoplay reel background"
        >
          <source src="https://portfolio-media.b-cdn.net/SYNC/media_various/Website_Header_V07_12mpbs_2460.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 id="intro-heading">LYON GRAULTY</h1>
          <p className="hero-subtitle type-overline">2D &amp; 3D MOTION DESIGNER</p>
          <ModalLink className="hero-inquiries-button type-button" modal="contact">
            Inquiries
          </ModalLink>
        </div>
      </div>
    </Section>
  );
}
