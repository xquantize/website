"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS, SCENE } from "@/lib/constants";
import {
  NEURAL_FIELD,
  combinedEdgeGlow,
  combinedLayerGlow,
  createCircleSpriteTexture,
  createLayeredNetwork,
  createTrainingSparks,
  createWavePool,
  driftedPosition,
  tickTrainingSparks,
  waveSpawnInterval,
  type ActivationWave,
} from "@/lib/neural-field";
import type { QualityTier } from "@/lib/quality";
import { QUALITY } from "@/lib/quality";
import { getScrollProgress } from "@/lib/scroll-layout-sync";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

const ACCENT = new THREE.Color(COLORS.accent);
const ACCENT_REST = new THREE.Color("#1f5c55");
const ACCENT_HOT = new THREE.Color("#c5fff2");

type Props = {
  tier: QualityTier;
};

export function NeuralField({ tier }: Props) {
  const cfg = NEURAL_FIELD[tier];
  const allowWaves = QUALITY.neuralWaves[tier];

  const network = useMemo(
    () => createLayeredNetwork(cfg, 88 + cfg.layers.length * 13),
    [cfg],
  );

  const { nodes, edges, layerCount } = network;

  const positions = useMemo(() => new Float32Array(nodes.length * 3), [nodes.length]);
  const nodeColors = useMemo(() => new Float32Array(nodes.length * 3), [nodes.length]);
  const nodeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));
    return g;
  }, [positions, nodeColors]);

  const linePositions = useMemo(() => {
    const arr = new Float32Array(edges.length * 6);
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const a = nodes[e.a];
      const b = nodes[e.b];
      const o = i * 6;
      arr[o] = a.x;
      arr[o + 1] = a.y;
      arr[o + 2] = a.z;
      arr[o + 3] = b.x;
      arr[o + 4] = b.y;
      arr[o + 5] = b.z;
    }
    return arr;
  }, [edges, nodes]);

  const lineColors = useMemo(() => new Float32Array(edges.length * 6), [edges.length]);
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));
    return g;
  }, [linePositions, lineColors]);

  const circleTex = useMemo(() => {
    const { canvas } = createCircleSpriteTexture();
    const tex = new THREE.CanvasTexture(canvas as HTMLCanvasElement);
    tex.needsUpdate = true;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => () => circleTex.dispose(), [circleTex]);

  const nodeMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: circleTex,
        color: 0xffffff,
        size: tier === "high" ? 0.42 : 0.36,
        sizeAttenuation: true,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        alphaTest: 0.015,
      }),
    [circleTex, tier],
  );

  const lineMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
      }),
    [],
  );

  const wavesRef = useRef<ActivationWave[]>(createWavePool(cfg.maxWaves));
  const sparksRef = useRef(createTrainingSparks(nodes, edges));
  const spawnTimer = useRef(0.7);
  const groupRef = useRef<THREE.Group>(null);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    sparksRef.current = createTrainingSparks(nodes, edges);
  }, [nodes, edges]);

  useFrame((_, delta) => {
    // --- Scroll travel: driven HERE from Lenis/page scroll, every frame -------
    // Not via GSAP scrub. Group slides past a fixed camera so layers visibly
    // enter from the bottom and leave through the top.
    const t = getScrollProgress();
    const travel =
      SCENE.travelYStart + (SCENE.travelYEnd - SCENE.travelYStart) * t;
    scrollAtmosphere.travelY = travel;
    scrollAtmosphere.pageScroll = t;
    if (groupRef.current) {
      groupRef.current.position.y = -travel;
    }

    const time = performance.now() * 0.001;
    const dt = Math.min(delta, 0.05);
    const amp = 0.02 * scrollAtmosphere.driftAmount;
    const restNode = 0.42 + scrollAtmosphere.nodeOpacity * 0.3;
    const restEdge = 0.12 + scrollAtmosphere.edgeOpacity * 0.1;
    const density = scrollAtmosphere.networkDensity;
    const pulse = scrollAtmosphere.pulseEnergy;

    const posAttr = nodeGeo.attributes.position as THREE.BufferAttribute;
    const colAttr = nodeGeo.attributes.color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    if (allowWaves) {
      spawnTimer.current -= dt;
      const interval =
        waveSpawnInterval(scrollAtmosphere.scrollDepth) / (0.45 + pulse * 0.75);

      if (spawnTimer.current <= 0) {
        spawnTimer.current = interval * (0.7 + Math.random() * 0.6);
        const slot = wavesRef.current.find((w) => !w.active);
        if (slot) {
          slot.active = true;
          slot.front = -0.35;
          slot.speed =
            (layerCount / (1.4 + Math.random() * 0.5)) * (0.85 + pulse * 0.3);
        }
      }

      for (const w of wavesRef.current) {
        if (!w.active) continue;
        w.front += dt * w.speed;
        if (w.front > layerCount + 0.5) w.active = false;
      }

      tickTrainingSparks(
        sparksRef.current,
        edges,
        dt,
        pulse,
        scrollAtmosphere.scrollDepth,
      );
    }

    const waves = wavesRef.current;
    const { nodeEnergy, edgeEnergy } = sparksRef.current;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const p = driftedPosition(n, time, amp);
      const o = i * 3;
      posArr[o] = p.x;
      posArr[o + 1] = p.y;
      posArr[o + 2] = p.z;

      const waveGlow = allowWaves ? combinedLayerGlow(waves, n.layer) : 0;
      const spark = allowWaves ? nodeEnergy[i] : 0;
      const glow = Math.min(1, Math.max(waveGlow * 0.9, spark));
      const intensity =
        restNode * (0.75 + density * 0.3) + glow * (0.85 + density * 0.35);
      tmpColor.copy(ACCENT_REST).lerp(ACCENT_HOT, glow).multiplyScalar(intensity);
      colArr[o] = tmpColor.r;
      colArr[o + 1] = tmpColor.g;
      colArr[o + 2] = tmpColor.b;
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    const linePos = lineGeo.attributes.position as THREE.BufferAttribute;
    const lineCol = lineGeo.attributes.color as THREE.BufferAttribute;
    const lp = linePos.array as Float32Array;
    const lc = lineCol.array as Float32Array;

    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const ao = e.a * 3;
      const bo = e.b * 3;
      const o = i * 6;
      lp[o] = posArr[ao];
      lp[o + 1] = posArr[ao + 1];
      lp[o + 2] = posArr[ao + 2];
      lp[o + 3] = posArr[bo];
      lp[o + 4] = posArr[bo + 1];
      lp[o + 5] = posArr[bo + 2];

      const waveGlow = allowWaves ? combinedEdgeGlow(waves, e.fromLayer, e.toLayer) : 0;
      const spark = allowWaves
        ? Math.max(edgeEnergy[i], nodeEnergy[e.a] * 0.5, nodeEnergy[e.b] * 0.5)
        : 0;
      const glow = Math.min(1, Math.max(waveGlow * 0.85, spark));
      const intensity = restEdge * (0.9 + density * 0.25) + glow * 1.15;
      tmpColor
        .copy(ACCENT_REST)
        .lerp(ACCENT, 0.2 + glow * 0.8)
        .multiplyScalar(intensity);
      for (let k = 0; k < 6; k += 3) {
        lc[o + k] = tmpColor.r;
        lc[o + k + 1] = tmpColor.g;
        lc[o + k + 2] = tmpColor.b;
      }
    }
    linePos.needsUpdate = true;
    lineCol.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeo} material={lineMat} frustumCulled={false} />
      <points geometry={nodeGeo} material={nodeMat} frustumCulled={false} />
    </group>
  );
}
