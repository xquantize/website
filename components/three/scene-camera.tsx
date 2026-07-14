"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE } from "@/lib/constants";
import { pointer, ensurePointerListener } from "@/lib/pointer";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

const look = new THREE.Vector3();

/**
 * Camera stays near y=0. The network group scrolls past it (see NeuralField),
 * so layers visibly sweep through the column as the page scrolls.
 */
export function SceneCamera() {
  const { camera } = useThree();

  useEffect(() => {
    ensurePointerListener();
    camera.position.set(0, 0, SCENE.cameraZ);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame(() => {
    const targetX = pointer.nx * SCENE.parallaxStrength.x;
    const targetY = -pointer.ny * SCENE.parallaxStrength.y;
    const targetZ = scrollAtmosphere.cameraZ;

    camera.position.x += (targetX - camera.position.x) * 0.08;
    camera.position.y += (targetY - camera.position.y) * 0.08;
    camera.position.z += (targetZ - camera.position.z) * 0.1;

    look.set(targetX * 0.25, targetY * 0.5, 0);
    camera.lookAt(look);
  });

  return null;
}
