"use client";

import dynamic from "next/dynamic";
import type { Project } from "@/lib/content";
import { ProjectNavTop, ProjectNavFooter } from "@/components/work/project-nav";

const Playground = dynamic(
  () => import("@/components/playground/playground").then((m) => m.Playground),
  {
    ssr: false,
    loading: () => (
      <p className="font-mono text-[0.65rem] tracking-[0.12em] uppercase opacity-35 py-16">
        Loading…
      </p>
    ),
  },
);

export function ProjectPageContent({ project }: { project: Project }) {
  const style = { "--project-accent": project.accent } as React.CSSProperties;

  return (
    <main
      className={`project-page${project.kind === "playground" ? " project-page--lab" : ""}`}
      style={style}
    >
      <ProjectNavTop />

      <header className="project-page__header">
        <p className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-40 mb-5">
          {project.id} · {project.status}
        </p>
        <h1
          className="font-serif italic font-light tracking-tight leading-[1.05] mb-4"
          style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)" }}
        >
          {project.hook}
        </h1>
        <p className="project-page__subtitle">{project.title}</p>
      </header>

      {project.kind === "playground" ? (
        <>
          <div className="project-page__lab">
            <Playground accent={project.accent} />
          </div>
          {project.intro && (
            <div className="project-page__prose">
              <p className="font-mono text-[0.65rem] tracking-[0.14em] uppercase opacity-35 mb-4">
                What you&apos;re seeing
              </p>
              <p className="text-sm opacity-50 leading-relaxed">{project.intro}</p>
            </div>
          )}
        </>
      ) : (
        <div className="project-case">
          <section className="project-case__block">
            <p className="project-case__label font-mono">Problem</p>
            <p className="project-case__text">{project.problem ?? project.description}</p>
          </section>
          <section className="project-case__block">
            <p className="project-case__label font-mono">Stack</p>
            <ul className="project-case__tags">
              {project.tags.map((tag) => (
                <li key={tag} className="font-mono">
                  {tag}
                </li>
              ))}
            </ul>
          </section>
          <p className="project-case__footnote font-mono">
            Case study forthcoming.
          </p>
        </div>
      )}

      <ProjectNavFooter project={project} />
    </main>
  );
}
