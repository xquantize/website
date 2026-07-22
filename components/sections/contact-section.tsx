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
    <section
      id="contact"
      className="content-section"
      data-chapter="04"
      data-chapter-label="Contact"
    >
      <ReadingPool>
        <ScrollReveal mode="once">
          <div className="section-stack section-stack--wide">
            <header className="section-header" data-section-anchor>
              <div className="section-divider" />
              <p className="section-kicker font-mono">Contact</p>
              <h2 className="section-title font-serif italic font-light tracking-tight">
                {SITE.contactHeading}
              </h2>
            </header>

            <div className="contact-layout pointer-events-auto">
              <div className="contact-layout__copy">
                <p className="contact-panel__lead">{SITE.contactLead}</p>
                <p className="contact-panel__copy">{SITE.contactCopy}</p>
              </div>
              <div className="contact-layout__actions">
                <a href={`mailto:${SITE.email}`} className="contact-panel__primary">
                  {SITE.contactCta}
                  <span className="contact-panel__email font-mono">{SITE.email}</span>
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
                    href={SITE.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-panel__social font-mono"
                  >
                    <LinkedInIcon className="contact-panel__social-icon" />
                    <span>LinkedIn</span>
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
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </ReadingPool>
    </section>
  );
}
