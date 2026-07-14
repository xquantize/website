export type HeroLinePart = {
  text: string;
  accent?: boolean;
};

export type HeroLine = HeroLinePart[];

export const SITE = {
  name: "Zane Neave",
  title: "ML & AI Engineer",
  tagline: "Vision, LLMs, OCR — models built to ship.",
  email: "zane.n.neave@gmail.com",
  github: "https://github.com/xquantize",
  linkedin: "https://www.linkedin.com/in/zane-neave-rex",
  orcid: "https://orcid.org/0009-0005-1559-1426",
  tensortonic: "https://www.tensortonic.com/profile/xquantize",
  availability: "Open to contracting",
  accent: "#7dd3c0",
  aboutHeading: "Applied ML across vision, language, and production.",
  bio: [
    "ML and AI engineer with broad experience across computer vision, large language models, OCR, and production ML systems.",
    "I've built perception pipelines, document intelligence, and model-driven products — from research prototypes to deployed systems in demanding real-world environments.",
    "Disciplined engineering meets research-driven iteration. I care about models that work outside the notebook, not just benchmarks.",
  ],
  capabilities: [
    "Computer vision",
    "LLMs & agents",
    "OCR & document AI",
    "Production ML",
    "Model training",
    "Edge deployment",
  ],
} as const;

export const HERO_LINES: HeroLine[] = [
  [{ text: "see it." }],
  [{ text: "read", accent: true }, { text: " it." }],
  [{ text: "ship it." }],
];

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
  {
    id: "02",
    slug: "document-ocr",
    title: "In-browser OCR",
    hook: "Text from pixels.",
    description:
      "Tesseract.js in the browser — drop any image with text, get line boxes and a transcript. No server upload. Pattern hints flag dates and amounts without pretending to understand the document.",
    intro:
      "OCR runs fully on-device via Tesseract WASM. Each line shows the engine’s own confidence. Optional regex hints surface date-like and amount-like tokens — they are not structured field extraction.",
    tags: ["OCR", "Vision", "Browser"],
    status: "Live",
    accent: "#e8b86d",
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
