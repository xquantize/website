import Link from "next/link";
import type { Project } from "@/lib/content";
import { getAdjacentProjects } from "@/lib/content";

export function ProjectNavTop() {
  return (
    <Link href="/#work" className="project-nav__back font-mono pointer-events-auto">
      ← All work
    </Link>
  );
}

export function ProjectNavFooter({ project }: { project: Project }) {
  const { prev, next } = getAdjacentProjects(project.slug);
  if (!prev && !next) return null;

  return (
    <nav className="project-nav__adjacent" aria-label="Adjacent projects">
      {prev ? (
        <Link
          href={`/work/${prev.slug}`}
          className="project-nav__link project-nav__link--prev font-mono pointer-events-auto"
        >
          <span className="project-nav__label">Previous</span>
          <span className="project-nav__name font-serif italic">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/work/${next.slug}`}
          className="project-nav__link project-nav__link--next font-mono pointer-events-auto"
        >
          <span className="project-nav__label">Next</span>
          <span className="project-nav__name font-serif italic">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
