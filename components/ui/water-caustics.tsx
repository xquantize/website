"use client";

import { useEffect, useRef } from "react";
import type { QualityTier } from "@/lib/quality";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";
import { usePrefersReducedMotion } from "@/lib/motion-preference";

type Props = { tier: QualityTier };

function causticValue(nx: number, ny: number, t: number) {
  const a =
    Math.sin(nx * 14 + t * 1.1) * Math.cos(ny * 11 - t * 0.85) +
    Math.sin(nx * 9 - t * 0.7 + ny * 7) * Math.cos(ny * 13 + t * 1.25) +
    Math.sin((nx + ny) * 17 + t * 1.4) * 0.6;
  const v = (a + 2.2) / 4.4;
  return Math.pow(Math.max(0, Math.min(1, v)), 2.4);
}

export function WaterCaustics({ tier }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const useCanvas = tier === "high" && !reducedMotion;

  useEffect(() => {
    if (!useCanvas) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let time = 0;
    let width = 0;
    let height = 0;
    let buffer: ImageData | null = null;
    let tick = 0;
    let visible = !document.hidden;

    const resize = () => {
      const scale = 0.28;
      width = Math.max(96, Math.floor(window.innerWidth * scale));
      height = Math.max(72, Math.floor(window.innerHeight * scale));
      canvas.width = width;
      canvas.height = height;
      buffer = ctx.createImageData(width, height);
    };

    const onVis = () => {
      visible = !document.hidden;
    };

    const draw = () => {
      frame = requestAnimationFrame(draw);
      if (!visible) return;

      tick++;
      if (tick % 3 !== 0) return;

      const strength = scrollAtmosphere.causticStrength;
      if (strength < 0.12) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      time += 0.018;
      if (!buffer) return;

      const data = buffer.data;
      for (let y = 0; y < height; y++) {
        const ny = y / height;
        for (let x = 0; x < width; x++) {
          const nx = x / width;
          const v = causticValue(nx, ny, time);
          const alpha = v * strength * 95;
          const idx = (y * width + x) * 4;
          data[idx] = 118;
          data[idx + 1] = 228;
          data[idx + 2] = 208;
          data[idx + 3] = alpha;
        }
      }

      ctx.putImageData(buffer, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [useCanvas]);

  if (reducedMotion) return null;

  if (!useCanvas) {
    return <div className="water-caustics water-caustics--css" aria-hidden="true" />;
  }

  return <canvas ref={canvasRef} className="water-caustics" aria-hidden="true" />;
}
