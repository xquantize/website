"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { COLORS } from "@/lib/constants";
import { pointer, ensurePointerListener } from "@/lib/pointer";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function DriftParticles() {
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const pointerActive = useRef(false);
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
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 3.5 && dist > 0.05) {
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

function ScrollSparkles() {
  const [opacity, setOpacity] = useState(0.35);
  const [speed, setSpeed] = useState(0.12);
  const lastUpdate = useRef(0);

  useFrame(({ clock }) => {
    if (clock.elapsedTime - lastUpdate.current < 0.05) return;
    lastUpdate.current = clock.elapsedTime;
    setOpacity(scrollAtmosphere.particleOpacity * 0.65);
    setSpeed(0.12 * scrollAtmosphere.particleSpeed);
  });

  return (
    <Sparkles
      count={80}
      scale={[22, 16, 6]}
      size={1.5}
      speed={speed}
      opacity={opacity}
      color={COLORS.seafoam}
    />
  );
}

export function ParticleField() {
  return (
    <>
      <DriftParticles />
      <ScrollSparkles />
    </>
  );
}
