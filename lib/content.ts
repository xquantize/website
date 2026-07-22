export type HeroLinePart = {
  text: string;
  accent?: boolean;
};

export type HeroLine = HeroLinePart[];

export type ExperienceItem = {
  role: string;
  org: string;
  period: string;
  summary: string;
};

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
  accent: "#c4a484",
  bioHeading: "A bit about me.",
  /** Short intro — who you are. */
  bio: [
    "I’m an ML and AI engineer focused on computer vision, document intelligence, and production systems — the kind of work that has to hold up outside a notebook.",
    "Research-minded when the problem needs it; pragmatic when it needs to ship. Available for contract work on vision, OCR, LLMs, and production ML.",
  ],
  experienceHeading: "Selected experience.",
  experienceIntro:
    "End-to-end ML work across perception, documents, and language — from prototypes to systems that run in the real world.",
  /** Contact section copy. */
  contactHeading: "Let’s work together.",
  contactLead: "Open to contracting",
  contactCopy:
    "Email me about vision, OCR, LLMs, or production ML — a scoped engagement, a prototype, or a walkthrough of the demos on this site.",
  contactCta: "Email about a contract",
  capabilities: [
    "Computer vision",
    "LLMs & agents",
    "OCR & document AI",
    "Production ML",
    "Model training",
    "Edge deployment",
  ],
} as const;

/** Edit these to match real roles / orgs — structure is ready for a CV-style list. */
export const EXPERIENCE: ExperienceItem[] = [
  {
    role: "ML & AI Engineer",
    org: "Contracting",
    period: "Present",
    summary:
      "Scoped engagements across computer vision, OCR/document AI, LLMs, and production ML — data, training, evaluation, and the engineering around the model.",
  },
  {
    role: "Computer vision & perception",
    org: "Applied ML",
    period: "Focus",
    summary:
      "Perception pipelines and model-driven products from research prototypes through to deployed systems in demanding environments.",
  },
  {
    role: "Document intelligence",
    org: "Applied ML",
    period: "Focus",
    summary:
      "OCR and document workflows that extract usable text and structure — with an eye on latency, robustness, and what the model actually got wrong.",
  },
];

export const HERO_LINES: HeroLine[] = [
  [{ text: "see it." }],
  [{ text: "read", accent: true }, { text: " it." }],
  [{ text: "ship it." }],
];

export const NAV = [
  { label: "Bio", href: "/#bio" },
  { label: "Experience", href: "/#experience" },
  { label: "Demos", href: "/#demos" },
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
  approach?: string;
  /** Optional closing note for case studies (results / when to use). */
  results?: string;
  tags: string[];
  status: string;
  accent: string;
  kind: ProjectKind;
  repoUrl?: string;
  demoUrl?: string;
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
      "Interactive lab: run forward passes, hinge loss, and manual backprop through a configurable MLP. Hover the decision boundary to probe the network — edge thickness tracks weight magnitude, and gradients pulse while training.",
    tags: ["Autograd", "ML", "Browser"],
    status: "Live",
    accent: "#c4a484",
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
      "Interactive lab: OCR runs fully on-device via Tesseract WASM. Each line shows the engine’s own confidence. Optional regex hints surface date-like and amount-like tokens — they are not structured field extraction.",
    tags: ["OCR", "Vision", "Browser"],
    status: "Live",
    accent: "#e8b86d",
    kind: "playground",
  },
  {
    id: "03",
    slug: "see-what-cnns-see",
    title: "See What CNNs See",
    hook: "Heatmaps that earn trust.",
    description:
      "From-scratch Grad-CAM, Grad-CAM++, and Score-CAM with one explain API — plus faithfulness curves so you know the map is doing real work, not random.",
    problem:
      "A model can be right for the wrong reasons. Without spatial explanations, it is hard to tell whether a CNN used the object you care about or a shortcut in the background, a logo, or co-occurring clutter.",
    approach:
      "Hook the last conv block, build a spatial importance map, upsample, and overlay. Three methods share one cam.explain API — no wrapper libs. Compare mode runs them side by side; deletion and insertion curves score the map against a random baseline. Ships as a CLI, Python API, and Gradio demo.",
    results:
      "Use when you need to debug vision models, teach XAI, or show stakeholders what the network actually attended to — with a check that the heatmap beats chance.",
    tags: ["Grad-CAM", "PyTorch", "XAI"],
    status: "Open source",
    accent: "#9db4c8",
    kind: "static",
    repoUrl: "https://github.com/xquantize/see-what-cnns-see",
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
