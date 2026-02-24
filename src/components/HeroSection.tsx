import Link from "next/link";
import { Section } from "@/components/Section";

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
          <source src="https://static1.squarespace.com/static/586488fed482e92ded46e4d8/t/6865d1d0951a0623556bc2ee/1751503316036/Website_Header_V07_12mpbs_2460.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 id="intro-heading">LYON GRAULTY</h1>
          <p className="hero-subtitle">2D &amp; 3D MOTION DESIGNER</p>
          <Link className="hero-inquiries-button" href="/contact">
            Inquiries
          </Link>
        </div>
      </div>
    </Section>
  );
}
