"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { PROJECTS, type Project } from "@/lib/content";
import { ProjectTab } from "@/components/ui/project-tab";

const Playground = dynamic(
  () => import("@/components/playground/playground").then((m) => m.Playground),
  {
    ssr: false,
    loading: () => (
      <p className="font-mono text-[0.7rem] tracking-[0.12em] uppercase opacity-40 py-12">
        Loading playground…
      </p>
    ),
  },
);

const DEFAULT_SLUG =
  PROJECTS.find((p) => p.kind === "playground")?.slug ?? PROJECTS[0].slug;

function hashToSlug(hash: string): string | null {
  const match = hash.match(/^#work-(\d+)$/);
  return match ? match[1] : null;
}

function slugToHash(slug: string): string {
  return `#work-${slug}`;
}

function getInitialSlug(): string | null {
  if (typeof window === "undefined") return null;
  const slug = hashToSlug(window.location.hash);
  return slug && PROJECTS.some((p) => p.slug === slug) ? slug : null;
}

function StaticStage({ project }: { project: Project }) {
  return (
    <div className="project-stage__static">
      <div
        className="project-stage__static-bg"
        style={{ background: project.gradient }}
        aria-hidden="true"
      />
      <div className="project-stage__static-content">
        <p className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-40 mb-4">
          {project.status}
        </p>
        <h3
          className="font-serif italic font-light tracking-tight leading-[1.1] mb-4 max-w-lg"
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
        >
          {project.title}
        </h3>
        <p className="text-sm opacity-50 leading-relaxed max-w-md mb-8">
          {project.description}
        </p>
        <ul className="project-stage__tags">
          {project.tags.map((tag) => (
            <li key={tag} className="font-mono text-[0.65rem] tracking-[0.12em] uppercase">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ProjectExplorer() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(getInitialSlug);
  const autoOpenedRef = useRef(selectedSlug !== null);

  const selectedProject = PROJECTS.find((p) => p.slug === selectedSlug) ?? null;
  const isOpen = selectedProject !== null;

  const selectProject = useCallback((slug: string) => {
    setSelectedSlug(slug);
    const hash = slugToHash(slug);
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }, []);

  useEffect(() => {
    const slug = hashToSlug(window.location.hash);
    if (slug && PROJECTS.some((p) => p.slug === slug)) {
      requestAnimationFrame(() => {
        document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !autoOpenedRef.current) {
          autoOpenedRef.current = true;
          if (!hashToSlug(window.location.hash)) {
            selectProject(DEFAULT_SLUG);
          }
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [selectProject]);

  useEffect(() => {
    const onHashChange = () => {
      const slug = hashToSlug(window.location.hash);
      if (slug && PROJECTS.some((p) => p.slug === slug)) {
        setSelectedSlug(slug);
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div ref={rootRef} className="project-explorer">
      <div className="project-strip" role="tablist" aria-label="Projects">
        {PROJECTS.map((project) => (
          <ProjectTab
            key={project.slug}
            project={project}
            selected={selectedSlug === project.slug}
            onSelect={() => selectProject(project.slug)}
          />
        ))}
      </div>

      <div
        className={`project-stage${isOpen ? " is-open" : ""}${selectedProject?.kind === "playground" ? " is-playground" : ""}`}
        aria-hidden={!isOpen}
      >
        <div className="project-stage__inner">
          {selectedProject && (
            <div
              key={selectedProject.slug}
              id={`project-stage-${selectedProject.slug}`}
              role="tabpanel"
              className="project-stage__panel"
            >
              {selectedProject.kind === "playground" ? (
                <Playground />
              ) : (
                <StaticStage project={selectedProject} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
