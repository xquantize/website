"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom } from "@react-three/postprocessing";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

export function AtmosphereBloom() {
  const [intensity, setIntensity] = useState(0.4);
  const current = useRef(0.4);
  const last = useRef(0);

  useFrame(({ clock }) => {
    if (clock.elapsedTime - last.current < 0.2) return;
    const next = scrollAtmosphere.bloomIntensity;
    if (Math.abs(next - current.current) > 0.025) {
      current.current = next;
      setIntensity(next);
      last.current = clock.elapsedTime;
    }
  });

  return (
    <Bloom
      intensity={intensity}
      luminanceThreshold={0.12}
      luminanceSmoothing={0.85}
      mipmapBlur={false}
    />
  );
}
