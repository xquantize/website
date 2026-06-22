export const SITE = {
  name: "Zane Neave",
  title: "ML & Autonomy Specialist",
  email: "zane.n.neave@gmail.com",
  github: "https://github.com/xquantize",
  linkedin: "https://www.linkedin.com/in/zane-neave-rex",
  orcid: "https://orcid.org/0009-0005-1559-1426",
  availability: "Open to contracting",
  bio: [
    "ML and autonomy specialist with deep experience in perception systems and large language models.",
    "I've designed and built autonomy stacks for multi-UXV, multi-domain vehicles — spanning air, surface, and sub-surface platforms.",
    "Disciplined engineering meets research-driven iteration. I care about systems that ship, not just demos.",
  ],
} as const;

export const NAV = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

export type ProjectKind = "playground" | "static";

export type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  status: string;
  gradient: string;
  kind: ProjectKind;
};

export const PROJECTS: Project[] = [
  {
    id: "01",
    slug: "01",
    title: "Scalar Autograd Playground",
    description:
      "Hand-rolled scalar autograd, an MLP a few neurons wide, trained in your browser. No framework, no server — watch the decision boundary form as gradients flow.",
    tags: ["Autograd", "ML", "Browser"],
    status: "Live",
    kind: "playground",
    gradient: "linear-gradient(135deg, #0e3a4a 0%, #1a6080 50%, #7dd3c0 100%)",
  },
  {
    id: "02",
    slug: "02",
    title: "Fleet Perception Pipeline",
    description:
      "Real-time sensor fusion and object tracking for coordinated multi-vehicle operations.",
    tags: ["Computer Vision", "PyTorch", "Sensor Fusion"],
    status: "Coming soon",
    kind: "static",
    gradient: "linear-gradient(135deg, #081420 0%, #2a5080 55%, #5ec4b8 100%)",
  },
  {
    id: "03",
    slug: "03",
    title: "LLM-Assisted Mission Planning",
    description:
      "Natural language interfaces for autonomous mission authoring, validation, and execution.",
    tags: ["LLMs", "Python", "FastAPI"],
    status: "Coming soon",
    kind: "static",
    gradient: "linear-gradient(135deg, #0a1830 0%, #3a2870 50%, #88c0e0 100%)",
  },
  {
    id: "04",
    slug: "04",
    title: "Cross-Domain UXV Coordination",
    description:
      "Distributed decision-making and state sharing for multi-agent autonomous systems.",
    tags: ["Multi-Agent", "Research", "Robotics"],
    status: "Coming soon",
    kind: "static",
    gradient: "linear-gradient(135deg, #051018 0%, #1a4555 45%, #6aabcc 100%)",
  },
];
