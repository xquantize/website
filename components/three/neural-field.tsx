"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "@/lib/constants";
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
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

const ACCENT = new THREE.Color(COLORS.accent);
const ACCENT_REST = new THREE.Color("#2a6b62");
const ACCENT_HOT = new THREE.Color("#b8fff0");

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
        size: tier === "high" ? 0.4 : 0.34,
        sizeAttenuation: true,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        alphaTest: 0.02,
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
  const spawnTimer = useRef(0.55);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  // Recreate sparks if topology changes
  useEffect(() => {
    sparksRef.current = createTrainingSparks(nodes, edges);
  }, [nodes, edges]);

  useMemo(() => {
    for (let i = 0; i < edges.length; i++) {
      const o = i * 6;
      for (let k = 0; k < 6; k += 3) {
        lineColors[o + k] = ACCENT_REST.r;
        lineColors[o + k + 1] = ACCENT_REST.g;
        lineColors[o + k + 2] = ACCENT_REST.b;
      }
    }
  }, [edges.length, lineColors]);

  useFrame((_, delta) => {
    const time = performance.now() * 0.001;
    const dt = Math.min(delta, 0.05);
    const amp = 0.06 * scrollAtmosphere.driftAmount;
    const restNode = 0.22 + scrollAtmosphere.nodeOpacity * 0.24;
    const restEdge = 0.045 + scrollAtmosphere.edgeOpacity * 0.035;
    const density = scrollAtmosphere.networkDensity;
    const pulse = scrollAtmosphere.pulseEnergy;

    const posAttr = nodeGeo.attributes.position as THREE.BufferAttribute;
    const colAttr = nodeGeo.attributes.color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    if (allowWaves) {
      // Layer sweeps — occasional structured forward pass
      spawnTimer.current -= dt;
      const interval =
        waveSpawnInterval(scrollAtmosphere.scrollDepth) /
        (0.35 + pulse * 0.9);

      if (spawnTimer.current <= 0) {
        spawnTimer.current = interval * (0.55 + Math.random() * 0.75);
        const slot = wavesRef.current.find((w) => !w.active);
        if (slot) {
          slot.active = true;
          slot.front = Math.random() < 0.22 ? -0.15 + Math.random() * 1.4 : -0.4;
          slot.speed =
            (layerCount / (1.05 + Math.random() * 0.65)) * (0.9 + pulse * 0.4);
        }
      }

      for (const w of wavesRef.current) {
        if (!w.active) continue;
        w.front += dt * w.speed;
        if (w.front > layerCount + 0.6) w.active = false;
      }

      // Stochastic training firings
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
      const glow = Math.min(1, Math.max(waveGlow * 0.85, spark));
      const intensity =
        restNode * (0.7 + density * 0.35) + glow * (0.7 + density * 0.5 + pulse * 0.2);
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
        ? Math.max(edgeEnergy[i], nodeEnergy[e.a] * 0.55, nodeEnergy[e.b] * 0.55)
        : 0;
      const glow = Math.min(1, Math.max(waveGlow * 0.75, spark));
      const intensity =
        restEdge * (0.85 + density * 0.3) + glow * (1.05 + density * 0.35);
      tmpColor
        .copy(ACCENT_REST)
        .lerp(ACCENT, 0.15 + glow * 0.85)
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
    <group>
      <lineSegments geometry={lineGeo} material={lineMat} frustumCulled={false} />
      <points geometry={nodeGeo} material={nodeMat} frustumCulled={false} />
    </group>
  );
}
