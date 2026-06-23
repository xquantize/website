import Link from "next/link";
import { ReadingPool } from "@/components/ui/reading-pool";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { PROJECTS } from "@/lib/content";

export function WorkSection() {
  return (
    <section id="work" className="content-section">
      <ReadingPool className="max-w-3xl w-full">
        <ScrollReveal mode="scrub">
          <div className="section-divider" />
          <p className="section-kicker font-mono text-[0.7rem] tracking-[0.15em] uppercase">
            Featured
          </p>
          <h2 className="section-title font-serif italic font-light tracking-tight max-w-lg">
            Interactive work.
          </h2>
        </ScrollReveal>

        <div className="work-featured">
          {PROJECTS.map((project, i) => (
            <ScrollReveal key={project.slug} mode="scrub" delay={i * 0.06}>
              <Link
                href={`/work/${project.slug}`}
                className="work-featured__row pointer-events-auto"
                style={{ "--project-accent": project.accent } as React.CSSProperties}
              >
                <h3 className="work-featured__hook font-serif italic font-light tracking-tight">
                  {project.hook}
                </h3>
                <p className="work-featured__desc">{project.description}</p>
                <span className="work-featured__cta font-mono">Live demo →</span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </ReadingPool>
    </section>
  );
}
