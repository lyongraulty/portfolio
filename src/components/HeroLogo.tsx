"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export function HeroLogo() {
  const [opacity, setOpacity] = useState(1);
  const rafRef = useRef<number | null>(null);

  const logoSrc = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "") + "/site/2019_Logo_BlackRing_NoBG_Large.png";

  useEffect(() => {
    const update = () => {
      const heroHeight = window.innerHeight;
      const fadeStart = heroHeight * 0.25;
      const fadeEnd = heroHeight * 0.65;
      const scrollY = window.scrollY;
      const next = scrollY <= fadeStart
        ? 1
        : scrollY >= fadeEnd
          ? 0
          : 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart);
      setOpacity(next);
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        update();
        rafRef.current = null;
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!logoSrc) return null;

  return (
    <Link
      href="/"
      aria-label="Lyon Graulty — home"
      style={{
        position: "fixed",
        top: "calc(var(--header-height, 56px) + clamp(1rem, 2.5vw, 2rem))",
        left: "clamp(1rem, 4vw, 3rem)",
        zIndex: 90,
        opacity,
        pointerEvents: opacity < 0.05 ? "none" : "auto",
        transition: "opacity 0.05s linear",
        display: "block",
      }}
    >
      <img
        src={logoSrc}
        alt="Lyon Graulty"
        style={{
          height: "clamp(56px, 7vw, 96px)",
          width: "auto",
          display: "block",
          filter: "invert(1)",
        }}
      />
    </Link>
  );
}
