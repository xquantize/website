import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { PROJECTS } from "@/lib/content";

export function WorkSection() {
  return (
    <section id="work" className="content-section">
      <div className="max-w-2xl w-full">
        <ScrollReveal>
          <div className="section-divider" />
          <p className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-40 mb-6">
            Featured
          </p>
          <h2
            className="font-serif italic font-light tracking-tight leading-[1.1] mb-12 max-w-lg"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Interactive work.
          </h2>
        </ScrollReveal>

        <div className="work-featured">
          {PROJECTS.map((project, i) => (
            <ScrollReveal key={project.slug} delay={i * 0.06}>
              <Link
                href={`/work/${project.slug}`}
                className="work-featured__card pointer-events-auto"
                style={{ "--project-accent": project.accent } as React.CSSProperties}
              >
                <div className="work-featured__meta font-mono">
                  <span>{project.id}</span>
                  <span>{project.status}</span>
                </div>

                <p className="work-featured__eyebrow font-mono">{project.title}</p>

                <h3 className="work-featured__hook font-serif italic font-light tracking-tight">
                  {project.hook}
                </h3>

                <p className="work-featured__desc">{project.description}</p>

                <ul className="work-featured__tags font-mono">
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>

                <span className="work-featured__cta font-mono">Live demo →</span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
