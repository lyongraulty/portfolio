import { AboutSection } from "@/components/AboutSection";
import { HeroSection } from "@/components/HeroSection";
import { InfoSection } from "@/components/InfoSection";
import { MusicSectionDark } from "@/components/MusicSectionDark";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ReelSection } from "@/components/ReelSection";
import { SandboxSectionWide } from "@/components/SandboxSectionWide";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ReelSection />
      <InfoSection />
      <ProjectsSection />
      <SandboxSectionWide />
      <MusicSectionDark />
    </>
  );
}
