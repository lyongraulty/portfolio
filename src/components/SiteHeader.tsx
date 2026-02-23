import Link from "next/link";
import { Container } from "@/components/Container";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { href: "/#reel", label: "Reel" },
  { href: "/#info", label: "Info" },
  { href: "/#projects", label: "Work" },
  { href: "/contact", label: "Contact" },
  { href: "/sandbox", label: "Sandbox" },
  { href: "/music", label: "Music" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
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
