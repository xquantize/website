import Balancer from "react-wrap-balancer";
import { ReadingPool } from "@/components/ui/reading-pool";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SITE } from "@/lib/content";

export function ContactSection() {
  return (
    <section id="contact" className="content-section">
      <ReadingPool>
        <ScrollReveal mode="once">
          <div className="section-stack">
            <header className="section-header">
              <div className="section-divider" />
              <p className="section-kicker font-mono">Contact</p>
              <h2 className="section-title font-serif italic font-light tracking-tight">
                <Balancer>Let&apos;s talk.</Balancer>
              </h2>
            </header>

            <div className="contact-panel pointer-events-auto">
              <p className="contact-panel__lead">{SITE.availability}</p>
              <p className="contact-panel__copy">
                Reach out by email or LinkedIn — happy to discuss ML work, contracting, or a live
                walkthrough of the demo.
              </p>
              <div className="contact-panel__actions">
                <a href={`mailto:${SITE.email}`} className="contact-panel__primary">
                  {SITE.email}
                </a>
                <a
                  href={SITE.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-panel__secondary font-mono"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </ReadingPool>
    </section>
  );
}
