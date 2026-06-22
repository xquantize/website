import { HeroOverlay } from "@/components/ui/hero-overlay";
import { SiteShell } from "@/components/layout/site-shell";
import { AboutSection } from "@/components/sections/about-section";
import { ContactSection } from "@/components/sections/contact-section";
import { SiteFooter } from "@/components/sections/site-footer";
import { WorkSection } from "@/components/sections/work-section";

export default function Home() {
  return (
    <SiteShell scrollAtmosphere>
      <section id="hero" className="hero-section">
        <HeroOverlay />
      </section>

      <WorkSection />
      <AboutSection />
      <ContactSection />
      <SiteFooter />
    </SiteShell>
  );
}
