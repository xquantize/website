"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

const FOG_COLOR = new THREE.Color("#081420");

export function SceneFog() {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2(FOG_COLOR, scrollAtmosphere.fogDensity);
    scene.background = null;

    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useFrame(() => {
    const fog = scene.fog;
    if (fog instanceof THREE.FogExp2) {
      fog.density = scrollAtmosphere.fogDensity;
    }
  });

  return null;
}
