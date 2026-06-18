import { HeroScene } from "@/components/three/hero-scene";
import { HeroOverlay } from "@/components/ui/hero-overlay";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { SiteNav } from "@/components/ui/site-nav";
import { AboutSection } from "@/components/sections/about-section";
import { WorkSection } from "@/components/sections/work-section";
import { ContactSection } from "@/components/sections/contact-section";

export default function Home() {
  return (
    <>
      <SiteNav />

      {/* Fixed background layers */}
      <div className="water-bg" aria-hidden="true" />
      <div className="canvas-container">
        <HeroScene />
      </div>
      <div className="vignette" />
      <div className="grain" />

      {/* Scrollable content */}
      <div className="scroll-content">
        <section id="hero" className="hero-section">
          <HeroOverlay />
        </section>

        <WorkSection />
        <AboutSection />
        <ContactSection />
      </div>

      <CustomCursor />
    </>
  );
}
