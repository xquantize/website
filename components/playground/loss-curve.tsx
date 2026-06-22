"use client";

type Props = { history: number[]; width?: number; height?: number };

export function LossCurve({ history, width = 480, height = 50 }: Props) {
  if (history.length < 2) {
    return (
      <svg width={width} height={height}>
        <line
          x1={0}
          y1={height - 1}
          x2={width}
          y2={height - 1}
          stroke="rgba(245,240,232,0.15)"
        />
      </svg>
    );
  }
  const max = Math.max(...history, 0.01);
  const points = history
    .map((v, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - (v / max) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline
        points={points}
        fill="none"
        stroke="rgba(184, 236, 244, 0.75)"
        strokeWidth={1.2}
      />
    </svg>
  );
}
