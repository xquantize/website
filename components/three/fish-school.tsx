"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "@/lib/constants";
import {
  createSchool,
  fishScrollDrift,
  FISH_VIEW_HALF,
  stepSchool,
  type Boid,
} from "@/lib/fish-boid";
import { ensurePointerListener, pointer } from "@/lib/pointer";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";
import { usePrefersReducedMotion } from "@/lib/motion-preference";

type FishSchoolProps = {
  count: number;
  centerZ: number;
  centerX?: number;
  seed?: number;
  scale?: number;
  opacity?: number;
  color?: string;
  spread?: { x: number; y: number; z: number };
  verticalDrift?: number;
  simSkip?: number;
};

function fishGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0.16, 0);
  shape.lineTo(-0.09, 0.048);
  shape.lineTo(-0.035, 0);
  shape.lineTo(-0.09, -0.048);
  shape.closePath();
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateY(Math.PI / 2);
  return geo;
}

const BOUNDS_Y = { min: -FISH_VIEW_HALF, max: FISH_VIEW_HALF };

export function FishSchool({
  count,
  centerZ,
  centerX = 0,
  seed = 0,
  scale = 0.55,
  opacity = 1,
  color = COLORS.seafoam,
  spread = { x: 5, y: FISH_VIEW_HALF * 1.6, z: 0.8 },
  verticalDrift = 0.003,
  simSkip = 1,
}: FishSchoolProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const boidsRef = useRef<Boid[]>([]);
  const pointerActive = useRef(false);
  const frameTick = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geometry = useMemo(() => fishGeometry(), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [color],
  );
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    ensurePointerListener();
    boidsRef.current = createSchool(count, centerZ, spread, seed, centerX);
    pointerActive.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, [count, centerZ, centerX, spread, seed]);

  useFrame(() => {
    if (reducedMotion) return;

    frameTick.current++;
    const runSim = frameTick.current % simSkip === 0;

    const mesh = meshRef.current;
    const boids = boidsRef.current;
    if (!mesh || boids.length === 0) return;

    const speedMul = scrollAtmosphere.fishSpeed * 0.9;
    const drift = verticalDrift + fishScrollDrift(scrollAtmosphere.pageScroll);

    if (runSim) {
      stepSchool(
        boids,
        {
          centerZ,
          centerX,
          bounds: { x: 12, y: FISH_VIEW_HALF },
          boundsY: BOUNDS_Y,
          maxSpeed: 0.055,
          speedMul,
          separation: 0.038,
          alignment: 0.028,
          cohesion: 0.022,
          cursorRepel: 0.11,
          boundsForce: 0.007,
          verticalDrift: drift,
        },
        {
          x: pointer.nx * 14,
          y: -pointer.ny * 9,
          active: pointerActive.current,
        },
      );
    }

    for (let i = 0; i < boids.length; i++) {
      const boid = boids[i];
      dummy.position.set(boid.x, boid.y, boid.z);

      const speed = Math.hypot(boid.vx, boid.vy, boid.vz);
      if (speed > 0.0005) {
        dummy.lookAt(boid.x + boid.vx, boid.y + boid.vy, boid.z + boid.vz);
      }

      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    material.opacity = Math.min(1, scrollAtmosphere.fishOpacity * opacity);
  });

  if (reducedMotion) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}
