import Link from "next/link";
import { ReadingPool } from "@/components/ui/reading-pool";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { PROJECTS } from "@/lib/content";

function projectStat(kind: (typeof PROJECTS)[number]["kind"], status: string) {
  if (kind === "playground") return `Browser · ${status}`;
  return status;
}

function projectCta(kind: (typeof PROJECTS)[number]["kind"]) {
  if (kind === "playground") return "Live demo →";
  return "Case study →";
}

export function WorkSection() {
  return (
    <section
      id="demos"
      className="content-section"
      data-chapter="03"
      data-chapter-label="Demos"
    >
      <ReadingPool>
        <ScrollReveal mode="once">
          <div className="section-stack">
            <header className="section-header" data-section-anchor>
              <div className="section-divider" />
              <p className="section-kicker font-mono">Demos</p>
              <h2 className="section-title font-serif italic font-light tracking-tight">
                Selected demos.
              </h2>
            </header>

            <div className="work-featured">
              {PROJECTS.map((project) => (
                <Link
                  key={project.slug}
                  href={`/work/${project.slug}`}
                  className="work-featured__row pointer-events-auto"
                  style={{ "--project-accent": project.accent } as React.CSSProperties}
                >
                  <div className="work-featured__meta font-mono">
                    <span>{project.id}</span>
                    <span>{projectStat(project.kind, project.status)}</span>
                  </div>
                  <div className="work-featured__main">
                    <h3 className="work-featured__title font-serif italic font-light tracking-tight">
                      {project.title}
                    </h3>
                    <p className="work-featured__hook font-serif italic">{project.hook}</p>
                    <p className="work-featured__desc">{project.description}</p>
                  </div>
                  <aside className="work-featured__aside">
                    <ul className="work-featured__tags">
                      {project.tags.map((tag) => (
                        <li key={tag} className="pill font-mono">
                          {tag}
                        </li>
                      ))}
                    </ul>
                    <span className="work-featured__cta font-mono">
                      {projectCta(project.kind)}
                    </span>
                  </aside>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </ReadingPool>
    </section>
  );
}
