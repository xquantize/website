"use client";

import { useMemo } from "react";
import type { NetworkSnapshot } from "@/lib/playground/network-snapshot";

type Props = {
  snapshot: NetworkSnapshot | null;
  running: boolean;
  width?: number;
};

const NODE_R = 4.5;
const PAD_X = 28;
const PAD_Y = 20;
const MAX_ROW_GAP = 18;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function activationFill(v: number) {
  const t = clamp01((Math.tanh(v) + 1) / 2);
  const r = Math.round(80 + 165 * t);
  const g = Math.round(160 + 80 * t);
  const b = Math.round(190 + 42 * t);
  return `rgba(${r}, ${g}, ${b}, ${0.35 + t * 0.55})`;
}

export function NetworkDiagram({ snapshot, running, width = 480 }: Props) {
  const layout = useMemo(() => {
    if (!snapshot) return null;

    const { sizes } = snapshot;
    const maxNodes = Math.max(...sizes);
    const height = Math.max(120, PAD_Y * 2 + (maxNodes - 1) * MAX_ROW_GAP);
    const cols = sizes.length;
    const positions: { x: number; y: number }[][] = [];

    for (let l = 0; l < cols; l++) {
      const n = sizes[l];
      const x = PAD_X + (l / Math.max(cols - 1, 1)) * (width - PAD_X * 2);
      const gap = Math.min(MAX_ROW_GAP, (height - PAD_Y * 2) / Math.max(n - 1, 1));
      const span = (n - 1) * gap;
      const y0 = (height - span) / 2;
      positions[l] = Array.from({ length: n }, (_, i) => ({
        x,
        y: n === 1 ? height / 2 : y0 + i * gap,
      }));
    }

    let maxWeight = 1e-6;
    let maxGrad = 1e-6;
    for (let l = 0; l < snapshot.weights.length; l++) {
      for (const row of snapshot.weights[l]) {
        for (const w of row) maxWeight = Math.max(maxWeight, Math.abs(w));
      }
      for (const row of snapshot.weightGrads[l]) {
        for (const g of row) maxGrad = Math.max(maxGrad, g);
      }
    }

    return { positions, height, maxWeight, maxGrad };
  }, [snapshot, width]);

  if (!snapshot || !layout) {
    return (
      <div className="lab-network lab-network--empty">
        <p className="lab-network__caption font-mono">Network</p>
      </div>
    );
  }

  const { positions, height, maxWeight, maxGrad } = layout;
  const layerLabels = ["x", "y", ...snapshot.sizes.slice(2, -1).map((_, i) => `h${i + 1}`), "out"];

  return (
    <div className={`lab-network${running ? " lab-network--live" : ""}`}>
      <div className="lab-network__head">
        <p className="lab-network__caption font-mono">Network · probe</p>
        <p className="lab-network__output font-mono">
          score {snapshot.output >= 0 ? "+" : ""}
          {snapshot.output.toFixed(3)}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="lab-network__svg"
        aria-hidden
      >
        {snapshot.weights.map((layerWeights, l) =>
          layerWeights.map((neuronWeights, j) =>
            neuronWeights.map((w, i) => {
              const from = positions[l][i];
              const to = positions[l + 1][j];
              const mag = Math.abs(w) / maxWeight;
              const grad = snapshot.weightGrads[l][j][i] / maxGrad;
              return (
                <line
                  key={`${l}-${i}-${j}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className="lab-network__edge"
                  stroke={
                    w >= 0
                      ? "var(--project-accent, #7dd3c0)"
                      : "rgba(100, 180, 200, 0.85)"
                  }
                  strokeOpacity={0.04 + mag * 0.42}
                  strokeWidth={0.6 + mag * 1.4 + (running ? grad * 1.2 : 0)}
                />
              );
            }),
          ),
        )}

        {snapshot.activations.map((layerActs, l) =>
          layerActs.map((act, i) => {
            const p = positions[l][i];
            const biasGrad = l > 0 ? snapshot.biasGrads[l - 1][i] / maxGrad : 0;
            return (
              <g key={`${l}-${i}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={NODE_R + (l === snapshot.activations.length - 1 ? 1.5 : 0)}
                  fill={activationFill(act)}
                  stroke="rgba(245, 240, 232, 0.35)"
                  strokeWidth={0.8 + (running ? biasGrad * 2.5 : 0)}
                />
              </g>
            );
          }),
        )}
      </svg>

      <div className="lab-network__labels font-mono">
        {layerLabels.map((label, l) => (
          <span key={label} style={{ left: `${(positions[l][0].x / width) * 100}%` }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
