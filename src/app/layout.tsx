import type { Metadata } from "next";
import { PT_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OverlayController } from "@/components/OverlayController";
import { SectionHoverObserver } from "@/components/SectionHoverObserver";
import { getTokens } from "../../fetch/getTokens";
import "./globals.css";

const ptMono = PT_Mono({
  variable: "--font-pt-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Minimal portfolio scaffold with dynamic project pages.",
};
export const dynamic = "force-dynamic";

function toCssVarName(key: string): string {
  const normalized = (key.startsWith("--") ? key.slice(2) : key)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized;
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const tokens = await getTokens();

  const cssVars = Object.entries(tokens)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      if (value === null || value === undefined || typeof value === "object") {
        return null;
      }

      const normalizedKey = toCssVarName(key);
      if (!normalizedKey) {
        return null;
      }
      return [`--${normalizedKey}`, String(value)] as const;
    })
    .filter((entry): entry is readonly [string, string] => entry !== null);

  const cssVarStyle = Object.fromEntries(cssVars) as React.CSSProperties;

  return (
    <html lang="en" className={ptMono.variable} style={cssVarStyle}>
      <body>
        <SiteHeader />
        <SectionHoverObserver />
        <main>{children}</main>
        <OverlayController />
        <SiteFooter />
      </body>
    </html>
  );
}
