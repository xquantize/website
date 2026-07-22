import { HeroOverlay } from "@/components/ui/hero-overlay";
import { SiteShell } from "@/components/layout/site-shell";
import { BioSection } from "@/components/sections/bio-section";
import { ContactSection } from "@/components/sections/contact-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { SiteFooter } from "@/components/sections/site-footer";
import { WorkSection } from "@/components/sections/work-section";

export default function Home() {
  return (
    <SiteShell scrollAtmosphere>
      <main id="main-content" className="home-page">
        <section id="hero" className="hero-section">
          <HeroOverlay />
        </section>

        <BioSection />
        <ExperienceSection />
        <WorkSection />
        <ContactSection />
        <SiteFooter />
      </main>
    </SiteShell>
  );
}
