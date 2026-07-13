import Link from "next/link";
import { ReadingPool } from "@/components/ui/reading-pool";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { PROJECTS } from "@/lib/content";

function projectStat(kind: (typeof PROJECTS)[number]["kind"], status: string) {
  if (kind === "playground") return `Browser · ${status}`;
  return status;
}

export function WorkSection() {
  return (
    <section id="work" className="content-section">
      <ReadingPool>
        <ScrollReveal mode="once">
          <div className="section-stack">
            <header className="section-header">
              <div className="section-divider" />
              <p className="section-kicker font-mono">Featured</p>
              <h2 className="section-title font-serif italic font-light tracking-tight">
                Interactive work.
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
                    <span>{project.status}</span>
                  </div>
                  <div className="work-featured__main">
                    <h3 className="work-featured__hook font-serif italic font-light tracking-tight">
                      {project.hook}
                    </h3>
                    <p className="work-featured__desc">{project.description}</p>
                  </div>
                  <aside className="work-featured__aside">
                    <p className="work-featured__stat font-mono">
                      {projectStat(project.kind, project.status)}
                    </p>
                    <ul className="work-featured__tags">
                      {project.tags.map((tag) => (
                        <li key={tag} className="pill font-mono">
                          {tag}
                        </li>
                      ))}
                    </ul>
                    <span className="work-featured__cta font-mono">Live demo →</span>
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
