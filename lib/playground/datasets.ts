export type Sample = { x: number; y: number; label: -1 | 1 };
export type DatasetKind = "xor" | "circle" | "gaussian" | "spiral";

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function makeDataset(kind: DatasetKind, n = 160, seed = 7): Sample[] {
  const rand = rng(seed);
  const out: Sample[] = [];

  if (kind === "xor") {
    for (let i = 0; i < n; i++) {
      const x = (rand() - 0.5) * 6;
      const y = (rand() - 0.5) * 6;
      out.push({ x, y, label: x * y > 0 ? 1 : -1 });
    }
  } else if (kind === "circle") {
    for (let i = 0; i < n; i++) {
      const x = (rand() - 0.5) * 6;
      const y = (rand() - 0.5) * 6;
      out.push({ x, y, label: Math.hypot(x, y) < 2 ? 1 : -1 });
    }
  } else if (kind === "gaussian") {
    for (let i = 0; i < n; i++) {
      const cls: -1 | 1 = i < n / 2 ? 1 : -1;
      const cx = cls === 1 ? -1.5 : 1.5;
      const cy = cls === 1 ? -1.5 : 1.5;
      out.push({
        x: cx + (rand() - 0.5) * 2,
        y: cy + (rand() - 0.5) * 2,
        label: cls,
      });
    }
  } else {
    const per = Math.floor(n / 2);
    for (let i = 0; i < per; i++) {
      const r = (i / per) * 2.5;
      const t1 = (i / per) * 3.5 + (rand() - 0.5) * 0.3;
      const t2 = t1 + Math.PI;
      out.push({ x: r * Math.cos(t1), y: r * Math.sin(t1), label: 1 });
      out.push({ x: r * Math.cos(t2), y: r * Math.sin(t2), label: -1 });
    }
  }
  return out;
}
