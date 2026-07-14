import { ReadingPool } from "@/components/ui/reading-pool";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import {
  GitHubIcon,
  LinkedInIcon,
  TensorTonicIcon,
} from "@/components/ui/social-icons";
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
                Let&apos;s talk.
              </h2>
            </header>

            <div className="contact-panel pointer-events-auto">
              <p className="contact-panel__lead">{SITE.availability}</p>
              <p className="contact-panel__copy">
                Reach out by email — happy to discuss ML work, contracting, or a live walkthrough
                of the demo.
              </p>
              <div className="contact-panel__actions">
                <a href={`mailto:${SITE.email}`} className="contact-panel__primary">
                  {SITE.email}
                </a>
                <div className="contact-panel__socials" aria-label="Profiles">
                  <a
                    href={SITE.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-panel__social font-mono"
                  >
                    <GitHubIcon className="contact-panel__social-icon" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href={SITE.tensortonic}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-panel__social font-mono"
                  >
                    <TensorTonicIcon className="contact-panel__social-icon" />
                    <span>TensorTonic</span>
                  </a>
                  <a
                    href={SITE.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-panel__social font-mono"
                  >
                    <LinkedInIcon className="contact-panel__social-icon" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </ReadingPool>
    </section>
  );
}
