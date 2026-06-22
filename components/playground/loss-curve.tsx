"use client";

type Props = { history: number[]; width?: number; height?: number };

export function LossCurve({ history, width = 480, height = 50 }: Props) {
  const baseline = height - 1;

  if (history.length < 2) {
    return (
      <svg width={width} height={height} className="lab-loss">
        <line x1={0} y1={baseline} x2={width} y2={baseline} stroke="rgba(245,240,232,0.12)" />
      </svg>
    );
  }

  const max = Math.max(...history, 0.01);
  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * width;
    const y = height - (v / max) * (height - 6) - 3;
    return { x, y };
  });
  const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${points[0].x.toFixed(1)},${baseline} ${polyline} ${points[points.length - 1].x.toFixed(1)},${baseline}`;

  return (
    <svg width={width} height={height} className="lab-loss" style={{ display: "block" }}>
      <defs>
        <linearGradient id="lab-loss-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#lab-loss-fill)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        className="lab-loss__line"
      />
    </svg>
  );
}
