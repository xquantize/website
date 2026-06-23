export const SITE = {
  name: "Zane Neave",
  title: "ML & Autonomy Specialist",
  email: "zane.n.neave@gmail.com",
  github: "https://github.com/xquantize",
  linkedin: "https://www.linkedin.com/in/zane-neave-rex",
  orcid: "https://orcid.org/0009-0005-1559-1426",
  availability: "Open to contracting",
  accent: "#7dd3c0",
  bio: [
    "ML and autonomy specialist with deep experience in perception systems and large language models.",
    "I've designed and built autonomy stacks for multi-UXV, multi-domain vehicles — spanning air, surface, and sub-surface platforms.",
    "Disciplined engineering meets research-driven iteration. I care about systems that ship, not just demos.",
  ],
} as const;

export const NAV = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

export type ProjectKind = "playground" | "static";

export type Project = {
  id: string;
  slug: string;
  title: string;
  hook: string;
  description: string;
  intro?: string;
  problem?: string;
  tags: string[];
  status: string;
  accent: string;
  kind: ProjectKind;
};

export const PROJECTS: Project[] = [
  {
    id: "01",
    slug: "autograd-playground",
    title: "Scalar Autograd Playground",
    hook: "Gradients, rendered.",
    description:
      "Hand-rolled scalar autograd and a live MLP — no PyTorch, no server. Train a tiny classifier in the browser and watch the decision boundary move step by step.",
    intro:
      "Each step is a full forward pass, hinge loss, and manual backprop through a configurable MLP. Hover the boundary to probe the network — edge thickness tracks weight magnitude, and gradients pulse while training.",
    tags: ["Autograd", "ML", "Browser"],
    status: "Live",
    accent: "#7dd3c0",
    kind: "playground",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string) {
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? PROJECTS[index - 1] : null,
    next: index < PROJECTS.length - 1 ? PROJECTS[index + 1] : null,
  };
}
