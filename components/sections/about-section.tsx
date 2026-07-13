import { ReadingPool } from "@/components/ui/reading-pool";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SITE } from "@/lib/content";

export function AboutSection() {
  return (
    <section id="about" className="content-section">
      <ReadingPool>
        <ScrollReveal mode="once">
          <div className="section-stack">
            <header className="section-header">
              <div className="section-divider" />
              <p className="section-kicker font-mono">About</p>
              <h2 className="section-title font-serif italic font-light tracking-tight">
                {SITE.aboutHeading}
              </h2>
            </header>

            <ul className="pill-row" aria-label="Core capabilities">
              {SITE.capabilities.map((item) => (
                <li key={item} className="pill font-mono">
                  {item}
                </li>
              ))}
            </ul>

            <div className="home-prose">
              {SITE.bio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="link-row">
              <a
                href={SITE.github}
                target="_blank"
                rel="noopener noreferrer"
                className="pill pill--link font-mono pointer-events-auto"
              >
                GitHub
              </a>
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="pill pill--link font-mono pointer-events-auto"
              >
                LinkedIn
              </a>
              <a
                href={SITE.orcid}
                target="_blank"
                rel="noopener noreferrer"
                className="pill pill--link font-mono pointer-events-auto"
              >
                ORCID
              </a>
            </div>
          </div>
        </ScrollReveal>
      </ReadingPool>
    </section>
  );
}
