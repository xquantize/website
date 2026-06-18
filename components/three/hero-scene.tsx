"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { ACESFilmicToneMapping, Vector2 } from "three";
import { COLORS, SCENE } from "@/lib/constants";
import { FloatingShapes } from "./floating-shapes";
import { SceneCamera } from "./scene-camera";

const CHROMA_OFFSET = new Vector2(0.001, 0.001);

export function HeroScene() {
  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.4,
      }}
      camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, SCENE.cameraZ] }}
      dpr={[1, 2]}
      style={{ background: COLORS.bg }}
    >
      {/* Deep water fog — tighter near clip gives depth fast */}
      <fog attach="fog" args={[COLORS.bg, 6, 22]} />

      {/* Ambient — deep ocean blue-black */}
      <ambientLight color="#0d1f35" intensity={1.2} />

      {/* Sun from above — caustic column of light */}
      <directionalLight
        color="#b8e4f0"
        intensity={1.5}
        position={[2, 8, 3]}
      />

      {/* Warm fill from below — reef reflection bounce */}
      <pointLight color="#e8703c" intensity={3} distance={18} position={[0, -4, 2]} />

      {/* Cool rim from behind — depth separation */}
      <pointLight color="#1a6080" intensity={2} distance={20} position={[0, 2, -8]} />

      {/* Accent — bioluminescent hint, shifts over time via FloatingShapes */}
      <pointLight color={COLORS.seafoam} intensity={1.5} distance={12} position={[-3, 1, 0]} />

      <FloatingShapes />
      <SceneCamera />

      <EffectComposer>
        <Bloom
          intensity={0.6}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.8}
          mipmapBlur
        />
        <ChromaticAberration offset={CHROMA_OFFSET} radialModulation={false} modulationOffset={0.5} />
      </EffectComposer>
    </Canvas>
  );
}
