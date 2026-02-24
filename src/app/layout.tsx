import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OverlayController } from "@/components/OverlayController";
import { SectionHoverObserver } from "@/components/SectionHoverObserver";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["200", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Minimal portfolio scaffold with dynamic project pages.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
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
