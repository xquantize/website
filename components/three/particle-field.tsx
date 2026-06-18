"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { COLORS } from "@/lib/constants";

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function DriftParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 320;

  const { positions, speeds, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds: number[] = [];
    const phases: number[] = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (seededRandom(i * 2.1) - 0.5) * 28;
      positions[i * 3 + 1] = (seededRandom(i * 3.3) - 0.5) * 18;
      positions[i * 3 + 2] = (seededRandom(i * 4.7) - 0.5) * 8 - 2;
      speeds.push(0.015 + seededRandom(i * 5.9) * 0.035);
      phases.push(seededRandom(i * 7.1) * Math.PI * 2);
    }
    return { positions, speeds, phases };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const arr = (ref.current.geometry.attributes.position as THREE.BufferAttribute)
      .array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * 0.012;
      arr[i * 3 + 0] += Math.sin(t * 0.1 + phases[i]) * 0.0015;
      if (arr[i * 3 + 1] > 10) arr[i * 3 + 1] = -10;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#b8ecf4"
        size={0.022}
        transparent
        opacity={0.55}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function ParticleField() {
  return (
    <>
      <DriftParticles />
      <Sparkles
        count={80}
        scale={[22, 16, 6]}
        size={1.5}
        speed={0.12}
        opacity={0.35}
        color={COLORS.seafoam}
      />
    </>
  );
}
