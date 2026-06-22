"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom } from "@react-three/postprocessing";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

export function AtmosphereBloom() {
  const [intensity, setIntensity] = useState(0.4);
  const lastUpdate = useRef(0);

  useFrame(({ clock }) => {
    if (clock.elapsedTime - lastUpdate.current < 0.04) return;
    const next = scrollAtmosphere.bloomIntensity;
    lastUpdate.current = clock.elapsedTime;
    setIntensity((prev) => (Math.abs(next - prev) > 0.008 ? next : prev));
  });

  return (
    <Bloom
      intensity={intensity}
      luminanceThreshold={0.1}
      luminanceSmoothing={0.9}
      mipmapBlur
    />
  );
}
