"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { COLORS } from "@/lib/constants";
import type { QualityTier } from "@/lib/quality";
import { QUALITY } from "@/lib/quality";
import { pointer, ensurePointerListener } from "@/lib/pointer";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

type Props = { tier: QualityTier };

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function DriftParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const pointerActive = useRef(false);

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
  }, [count]);

  useEffect(() => {
    ensurePointerListener();
    pointerActive.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const speedMul = scrollAtmosphere.particleSpeed;
    const arr = (ref.current.geometry.attributes.position as THREE.BufferAttribute)
      .array as Float32Array;
    const t = clock.getElapsedTime();

    const mx = pointer.nx * 14;
    const my = -pointer.ny * 9;
    const repulse = pointerActive.current;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      if (repulse) {
        const dx = arr[ix] - mx;
        const dy = arr[ix + 1] - my;
        const distSq = dx * dx + dy * dy;
        if (distSq < 12.25 && distSq > 0.0025) {
          const dist = Math.sqrt(distSq);
          const force = ((3.5 - dist) / 3.5) * 0.045;
          arr[ix] += (dx / dist) * force;
          arr[ix + 1] += (dy / dist) * force * 0.6;
        }
      }

      arr[ix + 1] += speeds[i] * 0.012 * speedMul;
      arr[ix] += Math.sin(t * 0.1 + phases[i]) * 0.0015 * speedMul;
      if (arr[ix + 1] > 10) arr[ix + 1] = -10;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;

    if (materialRef.current) {
      materialRef.current.opacity = scrollAtmosphere.particleOpacity;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
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

function ScrollSparkles({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <Sparkles
      count={count}
      scale={[22, 16, 6]}
      size={1.5}
      speed={0.1}
      opacity={0.32}
      color={COLORS.seafoam}
    />
  );
}

export function ParticleField({ tier }: Props) {
  const count = QUALITY.particles[tier];
  const sparkleCount = QUALITY.sparkles[tier];

  return (
    <>
      <DriftParticles count={count} />
      <ScrollSparkles count={sparkleCount} />
    </>
  );
}
