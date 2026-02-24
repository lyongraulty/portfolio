"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Container } from "@/components/Container";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { href: "/#reel", label: "Reel" },
  { href: "/#info", label: "Info" },
  { href: "/#projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
  { href: "/sandbox", label: "Sandbox" },
  { href: "/music", label: "Music" },
];

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const lastOffset = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    const updateState = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;
      const hero = document.querySelector<HTMLElement>("#intro");
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : -1;
      const info = document.querySelector<HTMLElement>("#info");
      const infoTop = info ? info.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
      const headerHeight = header.getBoundingClientRect().height || 1;

      header.dataset.backdrop = infoTop <= headerHeight ? "locked" : "hero";

      if (heroBottom > 0) {
        header.dataset.state = "top";
        lastOffset.current = 0;
        header.style.setProperty("--header-translate", "0px");
        lastScrollY.current = currentY;
        return;
      }

      const nextOffset = Math.min(0, Math.max(-headerHeight, lastOffset.current - delta));
      lastOffset.current = nextOffset;
      header.style.setProperty("--header-translate", `${nextOffset}px`);
      header.dataset.state = nextOffset < 0 ? "locked" : "shown";
      lastScrollY.current = currentY;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        updateState();
        ticking.current = false;
      });
    };

    updateState();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="site-header-backdrop" aria-hidden="true" />
      <Container className="site-header-inner">
        <nav aria-label="Primary navigation">
          <ul className="site-nav-list">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
