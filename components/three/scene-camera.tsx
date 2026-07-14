"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE } from "@/lib/constants";
import { pointer, ensurePointerListener } from "@/lib/pointer";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

const look = new THREE.Vector3();

export function SceneCamera() {
  const { camera } = useThree();

  useEffect(() => {
    ensurePointerListener();
  }, []);

  useFrame(() => {
    const ty = scrollAtmosphere.travelY;
    const targetX = pointer.nx * SCENE.parallaxStrength.x;
    const targetY = ty + -pointer.ny * SCENE.parallaxStrength.y;
    const targetZ = scrollAtmosphere.cameraZ;

    camera.position.x += (targetX - camera.position.x) * 0.06;
    camera.position.y += (targetY - camera.position.y) * 0.07;
    camera.position.z += (targetZ - camera.position.z) * 0.06;

    // Look slightly ahead down the stack so scrolling reads as moving through layers
    look.set(targetX * 0.35, ty - 0.85, 0);
    camera.lookAt(look);
  });

  return null;
}
