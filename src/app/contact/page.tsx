import { StaticOverlayWindow } from "@/components/StaticOverlayWindow";
import { ContactOverlayContent } from "@/components/ContactOverlayContent";

export default function ContactPage() {
  return (
    <StaticOverlayWindow dialogLabel="Let's talk overlay">
      <ContactOverlayContent />
    </StaticOverlayWindow>
  );
}
