"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { SCENE } from "@/lib/constants";
import { ParticleField } from "./particle-field";
import { SceneCamera } from "./scene-camera";

export function HeroScene() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 50, near: 0.1, far: 50, position: [0, 0, SCENE.cameraZ] }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
    >
      <ParticleField />
      <SceneCamera />

      <EffectComposer>
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
