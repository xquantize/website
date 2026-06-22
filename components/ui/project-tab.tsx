import type { Project } from "@/lib/content";

type Props = {
  project: Project;
  selected: boolean;
  onSelect: () => void;
};

export function ProjectTab({ project, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`project-tab${selected ? " is-selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
      aria-controls={`project-stage-${project.slug}`}
    >
      <div
        className="project-tab__visual"
        style={{ background: project.gradient }}
        aria-hidden="true"
      >
        <span className="project-tab__index font-mono">{project.id}</span>
      </div>
      <div className="project-tab__body">
        <span className="project-tab__status font-mono">{project.status}</span>
        <span className="project-tab__title font-serif">{project.title}</span>
      </div>
    </button>
  );
}
