import type { Project } from "@/lib/content";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <div
        className="project-card__visual"
        style={{ background: project.gradient }}
        aria-hidden="true"
      >
        <span className="project-card__index font-mono">{project.id}</span>
      </div>
      <div className="project-card__body">
        <div className="project-card__meta">
          <span className="font-mono text-[0.65rem] tracking-[0.15em] uppercase opacity-40">
            {project.status}
          </span>
        </div>
        <h3 className="project-card__title font-serif italic font-light tracking-tight">
          {project.title}
        </h3>
        <p className="project-card__desc text-sm opacity-50 leading-relaxed">
          {project.description}
        </p>
        <ul className="project-card__tags">
          {project.tags.map((tag) => (
            <li key={tag} className="font-mono text-[0.65rem] tracking-[0.12em] uppercase">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
