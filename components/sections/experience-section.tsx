import { ReadingPool } from "@/components/ui/reading-pool";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { EXPERIENCE, SITE } from "@/lib/content";

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="content-section"
      data-chapter="02"
      data-chapter-label="Experience"
    >
      <ReadingPool>
        <ScrollReveal mode="once">
          <div className="section-stack section-stack--wide">
            <header className="section-header section-header--split" data-section-anchor>
              <div className="section-header__lead">
                <div className="section-divider" />
                <p className="section-kicker font-mono">Experience</p>
                <h2 className="section-title font-serif italic font-light tracking-tight">
                  {SITE.experienceHeading}
                </h2>
              </div>
              <p className="experience-intro home-prose">{SITE.experienceIntro}</p>
            </header>

            <ul className="experience-list">
              {EXPERIENCE.map((item) => (
                <li key={`${item.role}-${item.org}-${item.period}`} className="experience-item">
                  <div className="experience-item__aside font-mono">
                    <span className="experience-item__period">{item.period}</span>
                    <span className="experience-item__org">{item.org}</span>
                  </div>
                  <div className="experience-item__body">
                    <h3 className="experience-item__role font-serif italic font-light tracking-tight">
                      {item.role}
                    </h3>
                    <p className="experience-item__summary">{item.summary}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </ReadingPool>
    </section>
  );
}
