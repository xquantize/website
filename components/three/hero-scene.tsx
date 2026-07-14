"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { SCENE } from "@/lib/constants";
import type { QualityTier } from "@/lib/quality";
import { QUALITY } from "@/lib/quality";
import { AtmosphereBloom } from "./atmosphere-bloom";
import { NeuralField } from "./neural-field";
import { SceneCamera } from "./scene-camera";
import { SceneFog } from "./scene-fog";
import { SceneLoop } from "./scene-loop";

type Props = { tier: QualityTier };

export function HeroScene({ tier }: Props) {
  const dprMax = QUALITY.dpr[tier];
  const bloom = QUALITY.bloom[tier];

  return (
    <Canvas
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      dpr={[1, dprMax]}
      camera={{ fov: SCENE.fov, near: 0.1, far: 100, position: [0, 0, SCENE.cameraZ] }}
      style={{ background: "transparent" }}
      performance={{ min: 0.5 }}
    >
      <SceneLoop />
      <NeuralField tier={tier} />
      <SceneCamera />
      <SceneFog />

      {bloom && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <AtmosphereBloom />
        </EffectComposer>
      )}
    </Canvas>
  );
}
