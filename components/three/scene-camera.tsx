"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { SCENE } from "@/lib/constants";
import { pointer, ensurePointerListener } from "@/lib/pointer";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

export function SceneCamera() {
  const { camera } = useThree();

  useEffect(() => {
    ensurePointerListener();
  }, []);

  useFrame(() => {
    camera.position.x += (pointer.nx * SCENE.parallaxStrength.x - camera.position.x) * 0.04;
    camera.position.y += (-pointer.ny * SCENE.parallaxStrength.y - camera.position.y) * 0.04;
    camera.position.z += (scrollAtmosphere.cameraZ - camera.position.z) * 0.06;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
