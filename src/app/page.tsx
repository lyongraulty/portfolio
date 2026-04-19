import { AboutSection } from "@/components/AboutSection";
import { HeroSection } from "@/components/HeroSection";
import { InfoSection } from "@/components/InfoSection";
import { MusicSectionDark } from "@/components/MusicSectionDark";
import { ProjectsMainTakeEntry } from "@/components/ProjectsMainTakeEntry";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ReelSection } from "@/components/ReelSection";
import { SandboxSectionWide } from "@/components/SandboxSectionWide";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const homeVariant = (process.env.HOME_PAGE_VARIANT ?? "").trim().toLowerCase();
  if (homeVariant === "projects-main-take") {
    return <ProjectsMainTakeEntry />;
  }

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
