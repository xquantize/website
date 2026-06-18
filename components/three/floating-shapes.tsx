"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE } from "@/lib/constants";

// ─── Coral Branch ───────────────────────────────────────────────────────────
// A vertical stack of tapered cylinders that branch at the top — stylised
// staghorn coral silhouette.

function CoralBranch({ position, scale, color, swayOffset }: {
  position: [number, number, number];
  scale: number;
  color: string;
  swayOffset: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    // gentle ocean-current sway, roots stay still, tips move most
    ref.current.rotation.z = Math.sin(t * 0.4 + swayOffset) * 0.04;
    ref.current.rotation.x = Math.cos(t * 0.3 + swayOffset) * 0.02;
  });

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.75,
    metalness: 0.05,
  }), [color]);

  return (
    <group ref={ref} position={position} scale={scale}>
      {/* Main stalk */}
      <mesh material={mat} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.04, 0.07, 1.0, 8]} />
      </mesh>
      {/* Branch left */}
      <mesh material={mat} position={[-0.15, 1.1, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.025, 0.04, 0.6, 7]} />
      </mesh>
      {/* Branch right */}
      <mesh material={mat} position={[0.15, 1.1, 0.05]} rotation={[0, 0, -0.45]}>
        <cylinderGeometry args={[0.025, 0.04, 0.6, 7]} />
      </mesh>
      {/* Branch mid */}
      <mesh material={mat} position={[0.05, 1.3, -0.1]} rotation={[0.2, 0, -0.15]}>
        <cylinderGeometry args={[0.02, 0.03, 0.45, 7]} />
      </mesh>
      {/* Tips */}
      <mesh material={mat} position={[-0.27, 1.4, 0]}>
        <sphereGeometry args={[0.04, 6, 6]} />
      </mesh>
      <mesh material={mat} position={[0.27, 1.38, 0.05]}>
        <sphereGeometry args={[0.04, 6, 6]} />
      </mesh>
      <mesh material={mat} position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.035, 6, 6]} />
      </mesh>
      <mesh material={mat} position={[0.1, 1.7, -0.1]}>
        <sphereGeometry args={[0.03, 6, 6]} />
      </mesh>
    </group>
  );
}

// ─── Brain / Boulder Coral ───────────────────────────────────────────────────
// Rounded dome with subdivision — just a smooth sphere, but grouped with
// smaller satellite spheres to read as a cluster.

function BoulderCoral({ position, scale, color, swayOffset }: {
  position: [number, number, number];
  scale: number;
  color: string;
  swayOffset: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.2 + swayOffset) * 0.03;
  });

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    metalness: 0.0,
  }), [color]);

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh material={mat}>
        <sphereGeometry args={[0.5, 32, 32]} />
      </mesh>
      <mesh material={mat} position={[0.4, -0.2, 0.2]}>
        <sphereGeometry args={[0.25, 24, 24]} />
      </mesh>
      <mesh material={mat} position={[-0.3, -0.25, 0.15]}>
        <sphereGeometry args={[0.2, 24, 24]} />
      </mesh>
    </group>
  );
}

// ─── Sea Fan / Gorgonian ─────────────────────────────────────────────────────
// A flat disc with a hole — reads as a sea fan silhouette from the front,
// thin from the side. Gentle sway.

function SeaFan({ position, scale, color, swayOffset }: {
  position: [number, number, number];
  scale: number;
  color: string;
  swayOffset: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.z = Math.sin(t * 0.35 + swayOffset) * 0.06;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[0.55, 0.06, 8, 32]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Bubble cluster ──────────────────────────────────────────────────────────

function Bubbles({ position, scale }: {
  position: [number, number, number];
  scale: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const offsets = useMemo(() =>
    Array.from({ length: 5 }, () => ({
      x: (Math.random() - 0.5) * 0.3,
      y: Math.random() * 0.5,
      z: (Math.random() - 0.5) * 0.3,
      size: 0.04 + Math.random() * 0.08,
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    })), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.children.forEach((child, i) => {
      child.position.y = offsets[i].y + Math.sin(t * offsets[i].speed + offsets[i].phase) * 0.15;
    });
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      {offsets.map((o, i) => (
        <mesh key={i} position={[o.x, o.y, o.z]}>
          <sphereGeometry args={[o.size, 12, 12]} />
          <meshPhysicalMaterial
            color="#a8e6e0"
            transparent
            opacity={0.25}
            roughness={0}
            metalness={0}
            transmission={0.9}
            thickness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Plankton / particles ────────────────────────────────────────────────────

function Plankton() {
  const ref = useRef<THREE.Points>(null);
  const count = 280;

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds: number[] = [];
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
      speeds.push(0.03 + Math.random() * 0.08);
    }
    return { positions, speeds };
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const arr = (ref.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * 0.01;
      arr[i * 3 + 0] += Math.sin(t * 0.2 + i) * 0.001;
      if (arr[i * 3 + 1] > 8) arr[i * 3 + 1] = -8;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a8e6e0"
        size={0.03}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

// ─── Scene ───────────────────────────────────────────────────────────────────

const CORAL_COLORS = {
  branch: ["#e8603c", "#e8845c", "#d4a847", "#c85f7a", "#e07060"],
  boulder: ["#d4956a", "#c8784a", "#b8916e", "#d4a870"],
  fan: ["#e05878", "#c8507a", "#a84870", "#d06888"],
};

export function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);

  const shapes = useMemo(() => [
    // Branches — scattered at different depths
    { type: "branch", position: [-3.5, -2.5, -2], scale: 1.8, color: CORAL_COLORS.branch[0], swayOffset: 0 },
    { type: "branch", position: [3.0, -3.0, -3], scale: 2.2, color: CORAL_COLORS.branch[1], swayOffset: 1.2 },
    { type: "branch", position: [-1.0, -2.8, -4], scale: 1.4, color: CORAL_COLORS.branch[2], swayOffset: 2.4 },
    { type: "branch", position: [5.0, -2.2, -5], scale: 1.6, color: CORAL_COLORS.branch[3], swayOffset: 0.8 },
    { type: "branch", position: [-5.5, -1.5, -4], scale: 1.9, color: CORAL_COLORS.branch[4], swayOffset: 3.1 },
    { type: "branch", position: [1.5, -2.5, -2.5], scale: 1.3, color: CORAL_COLORS.branch[0], swayOffset: 1.9 },

    // Boulders — heavier, lower
    { type: "boulder", position: [0, -3.5, -3], scale: 1.4, color: CORAL_COLORS.boulder[0], swayOffset: 0.5 },
    { type: "boulder", position: [-4.5, -3.2, -5], scale: 1.7, color: CORAL_COLORS.boulder[1], swayOffset: 2.0 },
    { type: "boulder", position: [4.5, -3.5, -4], scale: 1.2, color: CORAL_COLORS.boulder[2], swayOffset: 1.5 },

    // Sea fans — mid-water, facing camera
    { type: "fan", position: [-2.0, -0.5, -3], scale: 2.0, color: CORAL_COLORS.fan[0], swayOffset: 0.3 },
    { type: "fan", position: [2.5, 0.5, -4], scale: 2.5, color: CORAL_COLORS.fan[1], swayOffset: 1.8 },
    { type: "fan", position: [-5.0, 1.0, -5], scale: 1.8, color: CORAL_COLORS.fan[2], swayOffset: 3.5 },

    // Bubble clusters — rising, scattered
    { type: "bubbles", position: [-1.5, 0, -2], scale: 3.0, swayOffset: 0 },
    { type: "bubbles", position: [2.0, -1.0, -3], scale: 2.5, swayOffset: 1.0 },
    { type: "bubbles", position: [0.5, 1.5, -4], scale: 2.0, swayOffset: 2.0 },
  ] as const, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Very subtle slow drift — ocean current, not a spinning globe
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.08;
  });

  return (
    <group ref={groupRef}>
      {shapes.map((s, i) => {
        if (s.type === "branch") return <CoralBranch key={i} position={s.position} scale={s.scale} color={s.color} swayOffset={s.swayOffset} />;
        if (s.type === "boulder") return <BoulderCoral key={i} position={s.position} scale={s.scale} color={s.color} swayOffset={s.swayOffset} />;
        if (s.type === "fan") return <SeaFan key={i} position={s.position} scale={s.scale} color={s.color} swayOffset={s.swayOffset} />;
        if (s.type === "bubbles") return <Bubbles key={i} position={s.position} scale={s.scale} />;
        return null;
      })}
      <Plankton />
    </group>
  );
}
