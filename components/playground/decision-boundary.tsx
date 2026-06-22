"use client";

import { useEffect, useRef } from "react";
import type { Sample } from "@/lib/playground/datasets";

const GRID = 64;
const VIEW = 3.5;

type Props = {
  predict: (x: number, y: number) => number;
  samples: Sample[];
  tick: number;
  size?: number;
};

export function DecisionBoundary({ predict, samples, tick, size = 480 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    if (cvs.width !== size * dpr) {
      cvs.width = size * dpr;
      cvs.height = size * dpr;
      cvs.style.width = `${size}px`;
      cvs.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Decision heatmap
    const img = ctx.createImageData(GRID, GRID);
    for (let j = 0; j < GRID; j++) {
      for (let i = 0; i < GRID; i++) {
        const x = (i / (GRID - 1) - 0.5) * 2 * VIEW;
        const y = -(j / (GRID - 1) - 0.5) * 2 * VIEW;
        const v = Math.max(-1, Math.min(1, predict(x, y)));
        const t = (v + 1) / 2;
        // cream (positive) <-> seafoam (negative), matching site palette
        const r = Math.round(120 * (1 - t) + 245 * t);
        const g = Math.round(200 * (1 - t) + 240 * t);
        const b = Math.round(220 * (1 - t) + 232 * t);
        const idx = (j * GRID + i) * 4;
        img.data[idx] = r;
        img.data[idx + 1] = g;
        img.data[idx + 2] = b;
        img.data[idx + 3] = Math.round(40 + Math.abs(v) * 140);
      }
    }
    const off = document.createElement("canvas");
    off.width = GRID;
    off.height = GRID;
    off.getContext("2d")!.putImageData(img, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(off, 0, 0, size, size);

    // Grid
    ctx.strokeStyle = "rgba(245, 240, 232, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const p = (i / 6) * size;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(size, p);
      ctx.stroke();
    }

    // Samples
    for (const s of samples) {
      const px = ((s.x + VIEW) / (2 * VIEW)) * size;
      const py = ((-s.y + VIEW) / (2 * VIEW)) * size;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle =
        s.label === 1 ? "rgba(245, 240, 232, 0.95)" : "rgba(80, 170, 190, 0.95)";
      ctx.fill();
      ctx.strokeStyle = "rgba(8, 20, 32, 0.7)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [predict, samples, tick, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        background: "rgba(5, 12, 20, 0.4)",
        border: "1px solid rgba(245, 240, 232, 0.08)",
        borderRadius: 2,
      }}
    />
  );
}
