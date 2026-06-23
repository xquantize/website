"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { SCENE } from "@/lib/constants";
import { FISH_VIEW_HALF } from "@/lib/fish-boid";
import { ParticleField } from "./particle-field";
import { FishSchool } from "./fish-school";
import { SceneCamera } from "./scene-camera";
import { AtmosphereBloom } from "./atmosphere-bloom";

const schoolSpread = { x: 5.5, y: FISH_VIEW_HALF * 1.7, z: 0.9 };

export function HeroScene() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 50, near: 0.1, far: 50, position: [0, 0, SCENE.cameraZ] }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
    >
      <ParticleField />

      {/* Foreground school — cruises left of center */}
      <FishSchool
        count={22}
        centerZ={-1.5}
        centerX={-3.5}
        seed={11}
        scale={0.52}
        spread={schoolSpread}
        verticalDrift={0.0028}
      />

      {/* Mid school — main group drifting through the viewport */}
      <FishSchool
        count={20}
        centerZ={-3.5}
        centerX={2.5}
        seed={29}
        scale={0.44}
        opacity={0.85}
        color="#8ee4d4"
        spread={{ ...schoolSpread, x: 6 }}
        verticalDrift={-0.0022}
      />

      {/* Background school — smaller silhouettes */}
      <FishSchool
        count={14}
        centerZ={-6}
        centerX={-1}
        seed={47}
        scale={0.36}
        opacity={0.6}
        color="#6ec4b8"
        spread={{ ...schoolSpread, x: 7, z: 1.4 }}
        verticalDrift={0.0018}
      />

      <SceneCamera />

      <EffectComposer>
        <AtmosphereBloom />
      </EffectComposer>
    </Canvas>
  );
}
