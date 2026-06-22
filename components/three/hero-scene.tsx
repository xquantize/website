"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { SCENE } from "@/lib/constants";
import { ParticleField } from "./particle-field";
import { SceneCamera } from "./scene-camera";
import { AtmosphereBloom } from "./atmosphere-bloom";

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
        <AtmosphereBloom />
      </EffectComposer>
    </Canvas>
  );
}
