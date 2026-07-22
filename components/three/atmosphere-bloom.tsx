"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BloomEffect } from "postprocessing";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

/**
 * Bloom driven from scroll atmosphere — mutates the effect directly
 * (no React setState / THREE.Clock in the render loop).
 */
export function AtmosphereBloom() {
  const effect = useMemo(
    () =>
      new BloomEffect({
        intensity: 0.16,
        luminanceThreshold: 0.35,
        luminanceSmoothing: 0.92,
        mipmapBlur: false,
        levels: 3,
      }),
    [],
  );
  const lastMs = useRef(0);
  const current = useRef(0.16);

  useFrame(() => {
    const now = performance.now();
    if (now - lastMs.current < 200) return;
    lastMs.current = now;

    const next = scrollAtmosphere.bloomIntensity * 0.7;
    if (Math.abs(next - current.current) > 0.025) {
      current.current = next;
      effect.intensity = next;
    }
  });

  return <primitive object={effect} dispose={null} />;
}
