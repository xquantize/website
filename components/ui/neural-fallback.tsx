"use client";

import { useEffect, useRef } from "react";
import {
  NEURAL_FALLBACK,
  createLayeredNetwork,
  createTrainingSparks,
  createWavePool,
  driftedPosition,
  tickTrainingSparks,
  waveSpawnInterval,
  combinedEdgeGlow,
  combinedLayerGlow,
} from "@/lib/neural-field";
import { usePrefersReducedMotion } from "@/lib/motion-preference";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

type Props = {
  /** When true, ignore scroll atmosphere and stay calm/static-ish */
  ambient?: boolean;
};

/**
 * Low-cost Canvas2D layered network for mobile / low tier / reduced-motion.
 */
export function NeuralFallback({ ambient = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const network = createLayeredNetwork(NEURAL_FALLBACK, 91, true);
    const { nodes, edges, layerCount } = network;
    const waves = createWavePool(NEURAL_FALLBACK.maxWaves);
    const sparks = createTrainingSparks(nodes, edges);

    let spawnTimer = 1.0;
    let raf = 0;
    let last = performance.now();
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const drawNetwork = (
      time: number,
      amp: number,
      density: number,
      animate: boolean,
      travel: number,
    ) => {
      ctx.clearRect(0, 0, w, h);

      // travel 0→1 shifts the 2D graph upward so you move down through layers
      const yShift = ambient ? 0 : (travel - 0.5) * h * -0.55;

      const pts = nodes.map((n) => {
        const p = driftedPosition(n, time, amp);
        return {
          x: p.x * w,
          y: p.y * h + yShift,
          layer: n.layer,
          i: 0,
        };
      });
      pts.forEach((p, i) => {
        p.i = i;
      });

      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        const waveGlow = animate ? combinedEdgeGlow(waves, e.fromLayer, e.toLayer) : 0;
        const spark = animate
          ? Math.max(
              sparks.edgeEnergy[i],
              sparks.nodeEnergy[e.a] * 0.55,
              sparks.nodeEnergy[e.b] * 0.55,
            )
          : 0;
        const glow = Math.max(waveGlow * 0.75, spark);
        const alpha = 0.04 + density * 0.02 + glow * 0.6;
        ctx.strokeStyle = `rgba(125, 211, 192, ${alpha})`;
        ctx.lineWidth = 0.65 + glow * 1.8;
        ctx.beginPath();
        ctx.moveTo(pts[e.a].x, pts[e.a].y);
        ctx.lineTo(pts[e.b].x, pts[e.b].y);
        ctx.stroke();
      }

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const waveGlow = animate ? combinedLayerGlow(waves, p.layer) : 0;
        const spark = animate ? sparks.nodeEnergy[i] : 0;
        const glow = Math.max(waveGlow * 0.85, spark);
        const r = 1.4 + glow * 3.6;
        const alpha = 0.22 + density * 0.22 + glow * 0.65;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.2);
        g.addColorStop(0, `rgba(184, 255, 240, ${alpha})`);
        g.addColorStop(0.4, `rgba(125, 211, 192, ${alpha * 0.7})`);
        g.addColorStop(1, "rgba(125, 211, 192, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (reducedMotion) {
      drawNetwork(0, 0, ambient ? 0.45 : Math.max(0.35, scrollAtmosphere.networkDensity), false, 0.5);
      return () => window.removeEventListener("resize", resize);
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = now * 0.001;
      const density = ambient ? 0.45 : scrollAtmosphere.networkDensity;
      const pulseEnergy = ambient ? 0.4 : scrollAtmosphere.pulseEnergy;
      const amp = ambient ? 0.004 : 0.003 + scrollAtmosphere.driftAmount * 0.005;
      const travel = ambient ? 0.5 : scrollAtmosphere.scrollDepth;

      spawnTimer -= dt;
      const interval =
        (ambient ? 2.2 : waveSpawnInterval(scrollAtmosphere.scrollDepth)) /
        (0.4 + pulseEnergy);
      if (spawnTimer <= 0) {
        spawnTimer = interval * (0.65 + Math.random() * 0.7);
        const slot = waves.find((wv) => !wv.active);
        if (slot) {
          slot.active = true;
          slot.front = Math.random() < 0.2 ? Math.random() * 1.1 : -0.3;
          slot.speed = (layerCount / (1.2 + Math.random() * 0.6)) * (0.9 + pulseEnergy * 0.35);
        }
      }

      for (const wv of waves) {
        if (!wv.active) continue;
        wv.front += dt * wv.speed;
        if (wv.front > layerCount + 0.5) wv.active = false;
      }

      tickTrainingSparks(sparks, edges, dt, pulseEnergy, ambient ? 0.35 : scrollAtmosphere.scrollDepth);

      drawNetwork(time, amp, density, true, travel);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [ambient, reducedMotion]);

  return <canvas ref={canvasRef} className="neural-fallback" aria-hidden />;
}
