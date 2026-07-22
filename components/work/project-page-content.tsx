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

const ReceiptOcr = dynamic(
  () => import("@/components/ocr/receipt-ocr").then((m) => m.DocumentOcr),
  {
    ssr: false,
    loading: () => (
      <p className="font-mono text-[0.65rem] tracking-[0.12em] uppercase opacity-35 py-16">
        Loading OCR lab…
      </p>
    ),
  },
);

function PlaygroundForProject({ project }: { project: Project }) {
  if (project.slug === "document-ocr" || project.slug === "receipt-ocr") {
    return <ReceiptOcr accent={project.accent} />;
  }
  return <Playground accent={project.accent} />;
}

export function ProjectPageContent({ project }: { project: Project }) {
  const style = { "--project-accent": project.accent } as React.CSSProperties;

  return (
    <main
      id="main-content"
      className={`project-page${project.kind === "playground" ? " project-page--lab" : ""}`}
      style={style}
    >
      <ProjectNavTop />

      <header className="project-page__header">
        <p className="project-page__meta font-mono">
          {project.id} · {project.status}
        </p>
        <h1
          className="project-page__title font-serif italic font-light tracking-tight leading-[1.05]"
        >
          {project.title}
        </h1>
        <p className="project-page__hook font-serif italic">{project.hook}</p>
      </header>

      {project.kind === "playground" ? (
        <>
          {project.intro && (
            <div className="project-page__prose project-page__prose--lead">
              <p className="project-page__prose-label font-mono">Try this</p>
              <p className="project-page__intro">{project.intro}</p>
            </div>
          )}
          <div className="project-page__lab">
            <PlaygroundForProject project={project} />
          </div>
        </>
      ) : (
        <div className="project-case">
          <section className="project-case__block">
            <p className="project-case__label font-mono">Problem</p>
            <p className="project-case__text">{project.problem ?? project.description}</p>
          </section>
          {project.approach && (
            <section className="project-case__block">
              <p className="project-case__label font-mono">Approach</p>
              <p className="project-case__text">{project.approach}</p>
            </section>
          )}
          {project.results && (
            <section className="project-case__block">
              <p className="project-case__label font-mono">Use when</p>
              <p className="project-case__text">{project.results}</p>
            </section>
          )}
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
          {project.repoUrl || project.demoUrl ? (
            <div className="project-case__actions">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-case__cta font-mono"
                >
                  View on GitHub →
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-case__cta font-mono"
                >
                  Live demo →
                </a>
              )}
            </div>
          ) : (
            <p className="project-case__footnote font-mono">Case study forthcoming.</p>
          )}
        </div>
      )}

      <ProjectNavFooter project={project} />
    </main>
  );
}
