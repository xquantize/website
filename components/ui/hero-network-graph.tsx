"use client";

import { usePrefersReducedMotion } from "@/lib/motion-preference";

type Node = { id: string; label: string; x: number; y: number };

const NODES: Node[] = [
  { id: "vision", label: "Vision", x: 16, y: 24 },
  { id: "llm", label: "LLM", x: 84, y: 20 },
  { id: "ocr", label: "OCR", x: 50, y: 46 },
  { id: "train", label: "Train", x: 20, y: 74 },
  { id: "ship", label: "Ship", x: 80, y: 78 },
];

const EDGES: [string, string][] = [
  ["vision", "ocr"],
  ["llm", "ocr"],
  ["ocr", "train"],
  ["ocr", "ship"],
  ["train", "ship"],
];

const nodeById = Object.fromEntries(NODES.map((node) => [node.id, node])) as Record<
  string,
  Node
>;

function edgePath(from: Node, to: Node) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const cx = mx + (from.y - to.y) * 0.08;
  const cy = my + (to.x - from.x) * 0.08;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

export function HeroNetworkGraph() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="hero-graph-ambient" aria-hidden="true">
      <div className="hero-graph-ambient__frame">
        <svg
          className="hero-graph-ambient__svg"
          viewBox="0 0 100 100"
          role="img"
          aria-label="ML pipeline schematic"
        >
          <defs>
            <radialGradient id="hero-graph-ambient-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(125, 211, 192, 0.18)" />
              <stop offset="100%" stopColor="rgba(125, 211, 192, 0)" />
            </radialGradient>
          </defs>

          <rect
            x="8"
            y="10"
            width="84"
            height="80"
            rx="4"
            fill="url(#hero-graph-ambient-glow)"
            className={reducedMotion ? undefined : "hero-graph-ambient__glow"}
          />

          {EDGES.map(([fromId, toId]) => {
            const from = nodeById[fromId];
            const to = nodeById[toId];
            return (
              <path
                key={`${fromId}-${toId}`}
                d={edgePath(from, to)}
                className={`hero-graph-ambient__edge${
                  reducedMotion ? "" : " hero-graph-ambient__edge--flow"
                }`}
              />
            );
          })}

          {NODES.map((node, index) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="4.2"
                className={`hero-graph-ambient__node${
                  reducedMotion ? "" : " hero-graph-ambient__node--pulse"
                }`}
                style={
                  reducedMotion
                    ? undefined
                    : ({ animationDelay: `${index * -1.15}s` } as React.CSSProperties)
                }
              />
              <text
                x={node.x}
                y={node.y + 9.5}
                textAnchor="middle"
                className="hero-graph-ambient__label"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
