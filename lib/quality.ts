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
    const sync = () => setTier(detectQualityTier());
    sync();
    window.addEventListener("resize", sync, { passive: true });
    return () => window.removeEventListener("resize", sync);
  }, []);

  return tier;
}

export const QUALITY = {
  particles: { high: 280, medium: 180, low: 100 } as const,
  sparkles: { high: 60, medium: 0, low: 0 } as const,
  fishSchools: { high: 3, medium: 2, low: 1 } as const,
  fishCounts: {
    high: [20, 18, 12],
    medium: [16, 12],
    low: [14],
  } as const,
  dpr: { high: 1.5, medium: 1.25, low: 1 } as const,
  bloom: { high: true, medium: true, low: false } as const,
  causticsCanvas: { high: true, medium: false, low: false } as const,
};
