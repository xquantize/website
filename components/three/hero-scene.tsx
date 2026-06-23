"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { SCENE } from "@/lib/constants";
import { FISH_VIEW_HALF } from "@/lib/fish-boid";
import type { QualityTier } from "@/lib/quality";
import { QUALITY } from "@/lib/quality";
import { ParticleField } from "./particle-field";
import { FishSchool } from "./fish-school";
import { SceneCamera } from "./scene-camera";
import { SceneFog } from "./scene-fog";
import { SceneLoop } from "./scene-loop";
import { AtmosphereBloom } from "./atmosphere-bloom";

const schoolSpread = { x: 5.5, y: FISH_VIEW_HALF * 1.7, z: 0.9 };

type Props = { tier: QualityTier };

export function HeroScene({ tier }: Props) {
  const dprMax = QUALITY.dpr[tier];
  const bloom = QUALITY.bloom[tier];
  const schoolCount = QUALITY.fishSchools[tier];
  const fishCounts = QUALITY.fishCounts[tier];

  return (
    <Canvas
      gl={{
        antialias: tier === "high",
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      dpr={[1, dprMax]}
      camera={{ fov: 50, near: 0.1, far: 50, position: [0, 0, SCENE.cameraZ] }}
      style={{ background: "transparent" }}
    >
      <SceneLoop />
      <ParticleField tier={tier} />

      {schoolCount >= 1 && (
        <FishSchool
          count={fishCounts[0]}
          centerZ={-1.5}
          centerX={-3.5}
          seed={11}
          scale={0.52}
          spread={schoolSpread}
          verticalDrift={0.0028}
          simSkip={tier !== "high" ? 2 : 1}
        />
      )}

      {schoolCount >= 2 && fishCounts[1] != null && (
        <FishSchool
          count={fishCounts[1]}
          centerZ={-3.5}
          centerX={2.5}
          seed={29}
          scale={0.44}
          opacity={0.85}
          color="#8ee4d4"
          spread={{ ...schoolSpread, x: 6 }}
          verticalDrift={-0.0022}
          simSkip={tier !== "high" ? 2 : 1}
        />
      )}

      {schoolCount >= 3 && fishCounts[2] != null && (
        <FishSchool
          count={fishCounts[2]}
          centerZ={-6}
          centerX={-1}
          seed={47}
          scale={0.36}
          opacity={0.6}
          color="#6ec4b8"
          spread={{ ...schoolSpread, x: 7, z: 1.4 }}
          verticalDrift={0.0018}
          simSkip={1}
        />
      )}

      <SceneCamera />
      <SceneFog />

      {bloom && (
        <EffectComposer multisampling={tier === "high" ? 4 : 0}>
          <AtmosphereBloom />
        </EffectComposer>
      )}
    </Canvas>
  );
}
