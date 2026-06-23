import { ReadingPool } from "@/components/ui/reading-pool";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SITE } from "@/lib/content";

export function AboutSection() {
  return (
    <section id="about" className="content-section">
      <ReadingPool className="max-w-3xl">
        <ScrollReveal mode="scrub">
          <div className="section-divider" />
          <p className="section-kicker font-mono text-[0.7rem] tracking-[0.15em] uppercase">
            About
          </p>
          <h2 className="section-title font-serif italic font-light tracking-tight">
            Autonomy, perception,
            <br />
            and applied research.
          </h2>
          <div className="home-prose max-w-xl">
            {SITE.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8">
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="site-link font-mono text-[0.7rem] tracking-[0.15em] uppercase pointer-events-auto"
            >
              GitHub
            </a>
            <a
              href={SITE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="site-link font-mono text-[0.7rem] tracking-[0.15em] uppercase pointer-events-auto"
            >
              LinkedIn
            </a>
            <a
              href={SITE.orcid}
              target="_blank"
              rel="noopener noreferrer"
              className="site-link font-mono text-[0.7rem] tracking-[0.15em] uppercase pointer-events-auto"
            >
              ORCID
            </a>
          </div>
        </ScrollReveal>
      </ReadingPool>
    </section>
  );
}
