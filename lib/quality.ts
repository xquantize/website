"use client";

import { useEffect, useState } from "react";

export type QualityTier = "high" | "medium" | "low";

export function detectQualityTier(): QualityTier {
  if (typeof window === "undefined") return "high";

  const width = window.innerWidth;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

  if (width < 640 || (coarse && width < 900)) return "low";
  if (width < 1100 || mem === 2 || mem === 1) return "medium";
  return "high";
}

export function useQualityTier(): QualityTier {
  const [tier, setTier] = useState<QualityTier>("high");

  useEffect(() => {
    const sync = () => {
      const next = detectQualityTier();
      setTier(next);
      document.documentElement.classList.toggle("quality-low", next === "low");
      document.documentElement.classList.toggle("quality-medium", next === "medium");
      document.documentElement.classList.toggle("quality-high", next === "high");
    };
    sync();
    window.addEventListener("resize", sync, { passive: true });
    return () => window.removeEventListener("resize", sync);
  }, []);

  return tier;
}

/** Device-tier knobs for the neural background (WebGL + fallback). */
export const QUALITY = {
  /** Cap pixel ratio — full retina WebGL + bloom tanks scroll smoothness */
  dpr: { high: 1.25, medium: 1, low: 1 } as const,
  bloom: { high: true, medium: false, low: false } as const,
  /** WebGL neural field — low uses Canvas2D fallback instead */
  neuralWebGL: { high: true, medium: true, low: false } as const,
  /** Activation waves / glow (WebGL) */
  neuralWaves: { high: true, medium: true, low: false } as const,
  /** Synaptic pulse pool size */
  neuralPulses: { high: 18, medium: 12, low: 0 } as const,
} as const;
