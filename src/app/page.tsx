import { AboutSection } from "@/components/AboutSection";
import { HeroSection } from "@/components/HeroSection";
import { InfoSection } from "@/components/InfoSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { ReelSection } from "@/components/ReelSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ReelSection />
      <InfoSection />
      <ProjectsSection />
    </>
  );
}
