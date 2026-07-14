"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom } from "@react-three/postprocessing";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

export function AtmosphereBloom() {
  const [intensity, setIntensity] = useState(0.16);
  const current = useRef(0.16);
  const last = useRef(0);

  useFrame(({ clock }) => {
    if (clock.elapsedTime - last.current < 0.2) return;
    const next = scrollAtmosphere.bloomIntensity * 0.7;
    if (Math.abs(next - current.current) > 0.025) {
      current.current = next;
      setIntensity(next);
      last.current = clock.elapsedTime;
    }
  });

  return (
    <Bloom
      intensity={intensity}
      luminanceThreshold={0.35}
      luminanceSmoothing={0.92}
      mipmapBlur={false}
      levels={3}
    />
  );
}
