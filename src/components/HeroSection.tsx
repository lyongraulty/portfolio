import { Section } from "@/components/Section";
import { ModalLink } from "@/components/ModalLink";
import { toRenderableMediaUrl } from "@/lib/mediaUrl";

const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "";

export function HeroSection() {
  const logoSrc = MEDIA_BASE ? `${MEDIA_BASE}/site/2019_Logo_BlackRing_NoBG_Large.png` : "";
  const reelPoster = toRenderableMediaUrl("site/header_fallback.png");
  const reelVideo = toRenderableMediaUrl("site/header.mp4");
  return (
    <Section id="intro" size="large" fullBleed className="hero-section" data-tone="dark" aria-labelledby="intro-heading">
      {logoSrc && (
        <img
          src={logoSrc}
          alt=""
          className="hero-logo"
          aria-hidden="true"
        />
      )}
      <div className="hero-media-wrap">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={reelPoster}
          aria-label="Autoplay reel background"
        >
          <source src={reelVideo} type="video/mp4" />
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
