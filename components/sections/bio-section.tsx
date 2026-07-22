import { ReadingPool } from "@/components/ui/reading-pool";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SITE } from "@/lib/content";

export function BioSection() {
  return (
    <section
      id="bio"
      className="content-section"
      data-chapter="01"
      data-chapter-label="Bio"
    >
      <ReadingPool>
        <ScrollReveal mode="once">
          <div className="section-stack">
            <header className="section-header" data-section-anchor>
              <div className="section-divider" />
              <p className="section-kicker font-mono">Bio</p>
              <h2 className="section-title font-serif italic font-light tracking-tight">
                {SITE.bioHeading}
              </h2>
            </header>

            <div className="bio-layout">
              <div className="about-bio home-prose">
                {SITE.bio.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <aside className="bio-layout__aside">
                <div>
                  <p className="about-focus-label font-mono">Focus</p>
                  <ul className="pill-row" aria-label="Core capabilities">
                    {SITE.capabilities.map((item) => (
                      <li key={item} className="pill font-mono">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="about-focus-label font-mono">Elsewhere</p>
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
                      href={SITE.tensortonic}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill pill--link font-mono pointer-events-auto"
                    >
                      TensorTonic
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
              </aside>
            </div>
          </div>
        </ScrollReveal>
      </ReadingPool>
    </section>
  );
}
