"use client";

import { useEffect, useRef } from "react";
import {
  NEURAL_FALLBACK,
  createLayeredNetwork,
  createNeuralActivity,
  createWavePool,
  driftedPosition,
  tickNeuralActivity,
  waveSpawnInterval,
  combinedEdgeGlow,
  combinedLayerGlow,
} from "@/lib/neural-field";
import { usePrefersReducedMotion } from "@/lib/motion-preference";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";
import { getScrollProgress } from "@/lib/scroll-layout-sync";

type Props = {
  /** When true, ignore scroll atmosphere and stay calm/static-ish */
  ambient?: boolean;
};

/**
 * Low-cost Canvas2D layered network for mobile / low tier / reduced-motion.
 * Capped ~30fps ambient / ~45fps scroll-linked to keep the main thread free.
 */
export function NeuralFallback({ ambient = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const network = createLayeredNetwork(NEURAL_FALLBACK, 91, true);
    const {
      nodes,
      edges,
      layerCount,
      layerStarts,
      layerEnds,
      layerLabels,
      dropout,
    } = network;
    const waves = createWavePool(NEURAL_FALLBACK.maxWaves);
    const activity = createNeuralActivity(
      nodes,
      edges,
      layerStarts,
      layerEnds,
      16,
      dropout,
    );

    const pts = nodes.map(() => ({ x: 0, y: 0, layer: 0 }));
    const layerGlowCache = new Float32Array(layerCount);
    const edgeGlowCache = new Float32Array(edges.length);
    const frameBudget = ambient ? 1000 / 30 : 1000 / 45;

    let spawnTimer = 1.0;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let visible = true;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
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

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) {
        last = performance.now();
        acc = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const drawNetwork = (
      time: number,
      amp: number,
      density: number,
      animate: boolean,
      travel: number,
    ) => {
      ctx.clearRect(0, 0, w, h);

      const yShift = ambient ? 0 : (travel - 0.5) * h * -0.55;

      for (let i = 0; i < nodes.length; i++) {
        const p = driftedPosition(nodes[i], time, amp);
        pts[i].x = p.x * w;
        pts[i].y = p.y * h + yShift;
        pts[i].layer = nodes[i].layer;
      }

      if (animate) {
        for (let L = 0; L < layerCount; L++) {
          layerGlowCache[L] = combinedLayerGlow(waves, L);
        }
        for (let i = 0; i < edges.length; i++) {
          const e = edges[i];
          edgeGlowCache[i] = combinedEdgeGlow(waves, e.fromLayer, e.toLayer);
        }
      }

      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        const waveGlow = animate ? edgeGlowCache[i] : 0;
        const spark = animate
          ? Math.max(
              activity.edgeEnergy[i],
              activity.nodeEnergy[e.a] * 0.55,
              activity.nodeEnergy[e.b] * 0.55,
            )
          : 0;
        const glow = Math.max(waveGlow * 0.75, spark);
        const alpha =
          (0.02 + density * 0.015 + glow * 0.32) * (0.4 + e.weight * 0.55);
        ctx.strokeStyle =
          e.sign < 0
            ? `rgba(90, 130, 140, ${alpha * 0.65})`
            : `rgba(125, 211, 192, ${alpha})`;
        ctx.lineWidth = 0.3 + e.weight * 0.7 + glow * 0.8;
        ctx.beginPath();
        ctx.moveTo(pts[e.a].x, pts[e.a].y);
        ctx.lineTo(pts[e.b].x, pts[e.b].y);
        ctx.stroke();
      }

      if (animate) {
        for (const pu of activity.pulses) {
          if (!pu.active) continue;
          const e = edges[pu.edge];
          const tt = Math.max(0, Math.min(1, pu.t));
          const x = pts[e.a].x * (1 - tt) + pts[e.b].x * tt;
          const y = pts[e.a].y * (1 - tt) + pts[e.b].y * tt;
          ctx.fillStyle = "rgba(212, 255, 246, 0.85)";
          ctx.beginPath();
          ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(125, 211, 192, 0.28)";
      for (let L = 0; L < layerCount; L++) {
        let minX = Infinity;
        let ySum = 0;
        let count = 0;
        for (let i = layerStarts[L]; i < layerEnds[L]; i++) {
          minX = Math.min(minX, pts[i].x);
          ySum += pts[i].y;
          count++;
        }
        if (!count) continue;
        ctx.fillText(layerLabels[L], minX - 10, ySum / count);
      }

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const waveGlow = animate ? layerGlowCache[p.layer] : 0;
        const spark = animate ? activity.nodeEnergy[i] : 0;
        const isDropped = animate && activity.dropped[i] === 1;
        const glow = Math.max(waveGlow * 0.85, spark * spark);
        const r = (1.35 + glow * 2.8) * (isDropped ? 0.55 : 1);
        const alpha =
          (0.16 + density * 0.14 + glow * 0.45) * (isDropped ? 0.25 : 1);
        // Solid soft disc — cheaper than fresh radial gradients every neuron
        ctx.fillStyle = `rgba(125, 211, 192, ${alpha * 0.55})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.0, 0, Math.PI * 2);
        ctx.fill();
        if (glow > 0.08) {
          ctx.fillStyle = `rgba(212, 255, 246, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    if (reducedMotion) {
      drawNetwork(
        0,
        0,
        ambient ? 0.45 : Math.max(0.35, scrollAtmosphere.networkDensity),
        false,
        0.5,
      );
      return () => {
        window.removeEventListener("resize", resize);
        document.removeEventListener("visibilitychange", onVisibility);
      };
    }

    const tick = (now: number) => {
      if (!visible) return;
      const rawDt = now - last;
      last = now;
      acc += rawDt;
      if (acc < frameBudget) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(0.05, acc / 1000);
      acc = 0;

      const time = now * 0.001;
      const density = ambient ? 0.32 : scrollAtmosphere.networkDensity;
      const pulseEnergy = ambient ? 0.22 : scrollAtmosphere.pulseEnergy * 0.65;
      const amp = ambient ? 0.004 : 0.003 + scrollAtmosphere.driftAmount * 0.005;
      const travel = ambient ? 0.5 : getScrollProgress();

      spawnTimer -= dt;
      const interval =
        (ambient ? 2.2 : waveSpawnInterval(scrollAtmosphere.scrollDepth)) /
        (0.4 + pulseEnergy);
      if (spawnTimer <= 0) {
        spawnTimer = interval * (0.65 + Math.random() * 0.7);
        const slot = waves.find((wv) => !wv.active);
        if (slot) {
          slot.active = true;
          slot.front = -0.3;
          slot.speed =
            (layerCount / (1.4 + Math.random() * 0.5)) * (0.9 + pulseEnergy * 0.35);
        }
      }

      for (const wv of waves) {
        if (!wv.active) continue;
        wv.front += dt * wv.speed;
        if (wv.front > layerCount + 0.5) wv.active = false;
      }

      tickNeuralActivity(
        activity,
        edges,
        dt,
        pulseEnergy,
        ambient ? 0.35 : scrollAtmosphere.scrollDepth,
      );

      drawNetwork(time, amp, density, true, travel);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ambient, reducedMotion]);

  return <canvas ref={canvasRef} className="neural-fallback" aria-hidden />;
}
