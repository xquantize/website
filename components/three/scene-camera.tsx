"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { SCENE } from "@/lib/constants";

export function SceneCamera() {
  const mouse = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * SCENE.parallaxStrength.x - camera.position.x) * 0.04;
    camera.position.y += (-mouse.current.y * SCENE.parallaxStrength.y - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
