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
  createLayerLabelTexture,
  createLayeredNetwork,
  createNeuralActivity,
  createWavePool,
  driftedPosition,
  tickNeuralActivity,
  waveSpawnInterval,
  type ActivationWave,
} from "@/lib/neural-field";
import type { QualityTier } from "@/lib/quality";
import { QUALITY } from "@/lib/quality";
import { getScrollProgress } from "@/lib/scroll-layout-sync";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";

const ACCENT = new THREE.Color(COLORS.accent);
const ACCENT_REST = new THREE.Color("#1a4f49");
const ACCENT_HOT = new THREE.Color("#d4fff6");
const ACCENT_INPUT = new THREE.Color("#5a9e96");
const ACCENT_OUTPUT = new THREE.Color("#9af0e0");
const ACCENT_INHIB = new THREE.Color("#3a5a62");
const Y_UP = new THREE.Vector3(0, 1, 0);

type Props = {
  tier: QualityTier;
};

export function NeuralField({ tier }: Props) {
  const cfg = NEURAL_FIELD[tier];
  const allowWaves = QUALITY.neuralWaves[tier];
  const maxPulses = QUALITY.neuralPulses[tier];

  const network = useMemo(
    () => createLayeredNetwork(cfg, 88 + cfg.layers.length * 13),
    [cfg],
  );

  const { nodes, edges, layerCount, layerStarts, layerEnds, layerLabels, dropout } =
    network;

  const positions = useMemo(() => new Float32Array(nodes.length * 3), [nodes.length]);
  const nodeColors = useMemo(() => new Float32Array(nodes.length * 3), [nodes.length]);
  const nodeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));
    return g;
  }, [positions, nodeColors]);

  // Cheap unit box — scaled into weight-thick synapses (static matrices)
  const edgeGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const edgeMeshRef = useRef<THREE.InstancedMesh>(null);
  const edgeMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  // Precomputed edge rest radii from weights
  const edgeRadii = useMemo(
    () => Float32Array.from(edges.map((e) => 0.004 + e.weight * 0.016)),
    [edges],
  );

  const pulsePositions = useMemo(() => new Float32Array(maxPulses * 3), [maxPulses]);
  const pulseColors = useMemo(() => new Float32Array(maxPulses * 3), [maxPulses]);
  const pulseGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pulsePositions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(pulseColors, 3));
    return g;
  }, [pulsePositions, pulseColors]);

  const layerGlowCache = useMemo(() => new Float32Array(layerCount), [layerCount]);
  const edgeGlowCache = useMemo(() => new Float32Array(edges.length), [edges.length]);

  const circleTex = useMemo(() => {
    const { canvas } = createCircleSpriteTexture();
    const tex = new THREE.CanvasTexture(canvas as HTMLCanvasElement);
    tex.needsUpdate = true;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }, []);

  const labelSprites = useMemo(() => {
    return layerLabels.map((label, L) => {
      const { canvas } = createLayerLabelTexture(label);
      const tex = new THREE.CanvasTexture(canvas as HTMLCanvasElement);
      tex.needsUpdate = true;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.55, 0.28, 1);
      let minX = Infinity;
      let ySum = 0;
      let zSum = 0;
      let count = 0;
      for (let i = layerStarts[L]; i < layerEnds[L]; i++) {
        minX = Math.min(minX, nodes[i].x);
        ySum += nodes[i].y;
        zSum += nodes[i].z;
        count++;
      }
      sprite.position.set(minX - 0.7, count ? ySum / count : 0, count ? zSum / count : 0);
      sprite.frustumCulled = false;
      return sprite;
    });
  }, [layerLabels, layerStarts, layerEnds, nodes]);

  const nodeMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: circleTex,
        color: 0xffffff,
        size: tier === "high" ? 0.4 : 0.36,
        sizeAttenuation: true,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        alphaTest: 0.02,
      }),
    [circleTex, tier],
  );

  const pulseMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: circleTex,
        color: 0xffffff,
        size: tier === "high" ? 0.14 : 0.12,
        sizeAttenuation: true,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        alphaTest: 0.05,
      }),
    [circleTex, tier],
  );

  useEffect(() => {
    return () => {
      circleTex.dispose();
      for (const s of labelSprites) {
        s.material.map?.dispose();
        s.material.dispose();
      }
      edgeGeo.dispose();
      edgeMat.dispose();
      nodeGeo.dispose();
      pulseGeo.dispose();
      nodeMat.dispose();
      pulseMat.dispose();
    };
  }, [circleTex, labelSprites, edgeGeo, edgeMat, nodeGeo, pulseGeo, nodeMat, pulseMat]);

  const wavesRef = useRef<ActivationWave[]>(createWavePool(cfg.maxWaves));
  const activityRef = useRef(
    createNeuralActivity(nodes, edges, layerStarts, layerEnds, maxPulses, dropout),
  );
  const spawnTimer = useRef(1.1);
  const groupRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);
  const tmpDir = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    activityRef.current = createNeuralActivity(
      nodes,
      edges,
      layerStarts,
      layerEnds,
      maxPulses,
      dropout,
    );
  }, [nodes, edges, layerStarts, layerEnds, maxPulses, dropout]);

  // Build synapse instances ONCE — drift is tiny so edges stay on rest geometry
  useEffect(() => {
    const mesh = edgeMeshRef.current;
    if (!mesh) return;

    const colors = new Float32Array(edges.length * 3);
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const a = nodes[e.a];
      const b = nodes[e.b];
      tmpA.set(a.x, a.y, a.z);
      tmpB.set(b.x, b.y, b.z);
      tmpDir.subVectors(tmpB, tmpA);
      const len = Math.max(tmpDir.length(), 1e-4);
      tmpDir.multiplyScalar(1 / len);

      dummy.position.copy(tmpA).add(tmpB).multiplyScalar(0.5);
      dummy.quaternion.setFromUnitVectors(Y_UP, tmpDir);
      const radius = edgeRadii[i];
      // Box default is axis-aligned; Y is length after quaternion from Y_UP
      dummy.scale.set(radius * 2, len, radius * 2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const c = e.sign < 0 ? ACCENT_INHIB : ACCENT_REST;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
  }, [edges, nodes, edgeRadii, dummy, tmpA, tmpB, tmpDir]);

  useFrame((_, delta) => {
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
    const amp = 0.01 * scrollAtmosphere.driftAmount;
    const restNode = 0.2 + scrollAtmosphere.nodeOpacity * 0.14;
    const restEdge = 0.032 + scrollAtmosphere.edgeOpacity * 0.032;
    const density = scrollAtmosphere.networkDensity;
    const pulse = scrollAtmosphere.pulseEnergy * 0.65;

    const posAttr = nodeGeo.attributes.position as THREE.BufferAttribute;
    const colAttr = nodeGeo.attributes.color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    if (allowWaves) {
      spawnTimer.current -= dt;
      const interval =
        waveSpawnInterval(scrollAtmosphere.scrollDepth) / (0.55 + pulse * 0.45);
      if (spawnTimer.current <= 0) {
        spawnTimer.current = interval * (1.0 + Math.random() * 0.6);
        const slot = wavesRef.current.find((w) => !w.active);
        if (slot) {
          slot.active = true;
          slot.front = -0.4;
          slot.speed =
            (layerCount / (2.2 + Math.random() * 0.7)) * (0.7 + pulse * 0.25);
        }
      }
      for (const w of wavesRef.current) {
        if (!w.active) continue;
        w.front += dt * w.speed;
        if (w.front > layerCount + 0.5) w.active = false;
      }

      tickNeuralActivity(
        activityRef.current,
        edges,
        dt,
        pulse,
        scrollAtmosphere.scrollDepth,
      );

      // Cache glow once per layer / edge (avoids O(nodes×waves) recompute)
      for (let L = 0; L < layerCount; L++) {
        layerGlowCache[L] = combinedLayerGlow(wavesRef.current, L);
      }
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        edgeGlowCache[i] = combinedEdgeGlow(wavesRef.current, e.fromLayer, e.toLayer);
      }
    }

    const activity = activityRef.current;
    const { nodeEnergy, edgeEnergy, pulses, dropped } = activity;

    // Neurons — soft rest, restrained spike peaks
    const densN = 0.55 + density * 0.2;
    const densG = 0.55 + density * 0.2;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const p = driftedPosition(n, time, amp);
      const o = i * 3;
      posArr[o] = p.x;
      posArr[o + 1] = p.y;
      posArr[o + 2] = p.z;

      const waveGlow = allowWaves ? layerGlowCache[n.layer] * 0.45 : 0;
      const spike = allowWaves ? nodeEnergy[i] : 0;
      const glow = Math.min(0.72, Math.max(waveGlow, spike * spike * 0.85));
      const isInput = n.layer === 0;
      const isOutput = n.layer === layerCount - 1;
      const isDropped = allowWaves && dropped[i] === 1;
      const rest = isInput ? ACCENT_INPUT : isOutput ? ACCENT_OUTPUT : ACCENT_REST;

      const role = isOutput ? 0.8 : isInput ? 0.9 : 1;
      const dropMul = isDropped ? 0.18 : 1;
      const basel = restNode * densN * role * dropMul;
      const intensity = basel + glow * densG * (isDropped ? 0.12 : 1);
      const inv = 1 - glow * 0.75;
      const hotMix = glow * 0.75;
      colArr[o] = (rest.r * inv + ACCENT_HOT.r * hotMix) * intensity;
      colArr[o + 1] = (rest.g * inv + ACCENT_HOT.g * hotMix) * intensity;
      colArr[o + 2] = (rest.b * inv + ACCENT_HOT.b * hotMix) * intensity;
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // Synapse colors only (matrices are static)
    const mesh = edgeMeshRef.current;
    const ic = mesh?.instanceColor;
    if (mesh && ic) {
      const densE = 0.55 + density * 0.18;
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        const waveGlow = allowWaves ? edgeGlowCache[i] * 0.4 : 0;
        const syn = allowWaves
          ? Math.max(edgeEnergy[i] * 0.7, nodeEnergy[e.a] * 0.25, nodeEnergy[e.b] * 0.15)
          : 0;
        const glow = Math.min(0.65, Math.max(waveGlow, syn));
        const intensity =
          restEdge * densE * (0.5 + e.weight * 0.55) + glow * 0.55;
        const rest = e.sign < 0 ? ACCENT_INHIB : ACCENT_REST;
        const hot = e.sign < 0 ? ACCENT : ACCENT_HOT;
        const tGlow = 0.12 + glow * 0.55;
        const inv = 1 - tGlow;
        ic.setXYZ(
          i,
          (rest.r * inv + hot.r * tGlow) * intensity,
          (rest.g * inv + hot.g * tGlow) * intensity,
          (rest.b * inv + hot.b * tGlow) * intensity,
        );
      }
      ic.needsUpdate = true;
    }

    // Pulse particles
    const pp = pulseGeo.attributes.position as THREE.BufferAttribute;
    const pc = pulseGeo.attributes.color as THREE.BufferAttribute;
    const ppa = pp.array as Float32Array;
    const pca = pc.array as Float32Array;
    let anyPulse = false;
    for (let i = 0; i < pulses.length; i++) {
      const o = i * 3;
      const pu = pulses[i];
      if (!allowWaves || !pu.active) {
        if (ppa[o + 1] !== 999) {
          ppa[o] = 0;
          ppa[o + 1] = 999;
          ppa[o + 2] = 0;
          pca[o] = 0;
          pca[o + 1] = 0;
          pca[o + 2] = 0;
          anyPulse = true;
        }
        continue;
      }
      anyPulse = true;
      const e = edges[pu.edge];
      const tt = pu.t < 0 ? 0 : pu.t > 1 ? 1 : pu.t;
      const ax = nodes[e.a].x;
      const ay = nodes[e.a].y;
      const az = nodes[e.a].z;
      const bx = nodes[e.b].x;
      const by = nodes[e.b].y;
      const bz = nodes[e.b].z;
      ppa[o] = ax * (1 - tt) + bx * tt;
      ppa[o + 1] = ay * (1 - tt) + by * tt;
      ppa[o + 2] = az * (1 - tt) + bz * tt;
      const hot = pu.dir === 1 ? ACCENT_HOT : ACCENT;
      pca[o] = hot.r * 0.55;
      pca[o + 1] = hot.g * 0.55;
      pca[o + 2] = hot.b * 0.55;
    }
    if (anyPulse) {
      pp.needsUpdate = true;
      pc.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={edgeMeshRef}
        args={[edgeGeo, edgeMat, edges.length]}
        frustumCulled={false}
      />
      <points geometry={nodeGeo} material={nodeMat} frustumCulled={false} />
      <points geometry={pulseGeo} material={pulseMat} frustumCulled={false} />
      {labelSprites.map((sprite, i) => (
        <primitive key={layerLabels[i]} object={sprite} />
      ))}
    </group>
  );
}
