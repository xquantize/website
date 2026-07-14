import type { QualityTier } from "./quality";

/** Deterministic mulberry32 */
export function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type NeuralNode = {
  x: number;
  y: number;
  z: number;
  layer: number;
  phase: number;
  speed: number;
};

export type NeuralEdge = {
  a: number;
  b: number;
  fromLayer: number;
  toLayer: number;
};

export type ActivationWave = {
  /** Position in layer-index space (can start slightly before 0) */
  front: number;
  speed: number;
  active: boolean;
};

export type LayeredNetworkConfig = {
  /** Node counts per layer (top → bottom) */
  layers: readonly number[];
  /** How many next-layer targets each node links to */
  linksPerNode: number;
  maxWaves: number;
  /** Horizontal span within a layer (column width in world units) */
  columnWidth: number;
  /** Vertical span from first to last layer */
  height: number;
  depthJitter: number;
};

/**
 * Desktop WebGL — classic MLP diagram: even rows, generous vertical gaps,
 * wide enough to read in the right-hand column.
 */
export const NEURAL_FIELD: Record<QualityTier, LayeredNetworkConfig> = {
  high: {
    layers: [5, 7, 6, 7, 5, 4],
    linksPerNode: 2,
    maxWaves: 3,
    columnWidth: 4.0,
    height: 14,
    depthJitter: 0.08,
  },
  medium: {
    layers: [5, 6, 6, 5, 4],
    linksPerNode: 2,
    maxWaves: 2,
    columnWidth: 3.6,
    height: 12,
    depthJitter: 0.06,
  },
  low: {
    layers: [4, 6, 5, 4],
    linksPerNode: 2,
    maxWaves: 2,
    columnWidth: 3.2,
    height: 10,
    depthJitter: 0.05,
  },
};

/** Mobile / low-tier Canvas2D — vertical layers, ambient full-frame */
export const NEURAL_FALLBACK: LayeredNetworkConfig = {
  layers: [4, 5, 5, 4, 3],
  linksPerNode: 2,
  maxWaves: 2,
  columnWidth: 1,
  height: 1,
  depthJitter: 0,
};

export type LayeredNetwork = {
  nodes: NeuralNode[];
  edges: NeuralEdge[];
  layerCount: number;
  layerStarts: number[];
  layerEnds: number[];
};

/**
 * Build an MLP layout: layers top→bottom (Y), nodes across X within each layer,
 * light Z jitter. Edges only between adjacent layers.
 */
export function createLayeredNetwork(
  cfg: LayeredNetworkConfig,
  seed = 42,
  /** When true, positions are normalized 0–1 for Canvas2D */
  normalized2d = false,
): LayeredNetwork {
  const rng = createRng(seed);
  const nodes: NeuralNode[] = [];
  const layerStarts: number[] = [];
  const layerEnds: number[] = [];
  const layerCount = cfg.layers.length;
  const maxCount = Math.max(...cfg.layers);

  for (let L = 0; L < layerCount; L++) {
    const count = cfg.layers[L];
    layerStarts.push(nodes.length);
    // 0 = top, 1 = bottom
    const t = layerCount === 1 ? 0.5 : L / (layerCount - 1);

    for (let i = 0; i < count; i++) {
      const v = count === 1 ? 0.5 : i / (count - 1);

      if (normalized2d) {
        nodes.push({
          x: 0.62 + (v - 0.5) * 0.46,
          y: 0.1 + t * 0.8,
          z: 0,
          layer: L,
          phase: rng() * Math.PI * 2,
          speed: 0.08 + rng() * 0.12,
        });
      } else {
        // Even horizontal spacing per layer — classic clean MLP diagram
        nodes.push({
          x: (v - 0.5) * cfg.columnWidth,
          y: (0.5 - t) * cfg.height,
          z: (rng() * 2 - 1) * cfg.depthJitter,
          layer: L,
          phase: rng() * Math.PI * 2,
          speed: 0.08 + rng() * 0.14,
        });
      }
    }
    layerEnds.push(nodes.length);
  }

  const edges: NeuralEdge[] = [];
  for (let L = 0; L < layerCount - 1; L++) {
    const a0 = layerStarts[L];
    const a1 = layerEnds[L];
    const b0 = layerStarts[L + 1];
    const b1 = layerEnds[L + 1];

    // Nearest-X targets only — no wraparound / long diagonals that cross the column.
    for (let i = a0; i < a1; i++) {
      const srcX = nodes[i].x;
      const ranked: { j: number; d: number }[] = [];
      for (let j = b0; j < b1; j++) {
        ranked.push({ j, d: Math.abs(nodes[j].x - srcX) });
      }
      ranked.sort((a, b) => a.d - b.d || a.j - b.j);
      const nLinks = Math.min(cfg.linksPerNode, ranked.length);
      for (let k = 0; k < nLinks; k++) {
        edges.push({ a: i, b: ranked[k].j, fromLayer: L, toLayer: L + 1 });
      }
    }
  }

  return { nodes, edges, layerCount, layerStarts, layerEnds };
}

export function createWavePool(maxWaves: number): ActivationWave[] {
  return Array.from({ length: maxWaves }, () => ({
    front: 0,
    speed: 1,
    active: false,
  }));
}

/** Spawn interval — calmer at surface, more frequent at depth */
export function waveSpawnInterval(scrollDepth: number): number {
  return 2.8 - scrollDepth * 2.0;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Glow intensity for a layer given a wave front in layer-index space.
 * Soft bell — eases in/out, not binary. Wave travels top→bottom (increasing L).
 */
export function layerGlow(waveFront: number, layerIndex: number, width = 0.95): number {
  const d = Math.abs(waveFront - layerIndex);
  if (d >= width) return 0;
  const u = 1 - d / width;
  return smoothstep(0, 1, u) * smoothstep(0, 1, u);
}

export function edgeGlow(waveFront: number, fromLayer: number, toLayer: number): number {
  const mid = (fromLayer + toLayer) / 2;
  return Math.max(
    layerGlow(waveFront, fromLayer, 0.85),
    layerGlow(waveFront, mid, 0.7),
    layerGlow(waveFront, toLayer, 0.85),
  );
}

export function combinedLayerGlow(waves: ActivationWave[], layerIndex: number): number {
  let max = 0;
  for (const w of waves) {
    if (!w.active) continue;
    max = Math.max(max, layerGlow(w.front, layerIndex));
  }
  return Math.min(1, max);
}

export function combinedEdgeGlow(
  waves: ActivationWave[],
  fromLayer: number,
  toLayer: number,
): number {
  let max = 0;
  for (const w of waves) {
    if (!w.active) continue;
    max = Math.max(max, edgeGlow(w.front, fromLayer, toLayer));
  }
  return Math.min(1, max);
}

/** Per-node / per-edge energy for stochastic "training" firings */
export type TrainingSparks = {
  nodeEnergy: Float32Array;
  edgeEnergy: Float32Array;
  /** Outgoing edge indices per node for cascade */
  outgoing: number[][];
};

export function createTrainingSparks(
  nodes: NeuralNode[],
  edges: NeuralEdge[],
): TrainingSparks {
  const outgoing: number[][] = Array.from({ length: nodes.length }, () => []);
  for (let i = 0; i < edges.length; i++) {
    outgoing[edges[i].a].push(i);
  }
  return {
    nodeEnergy: new Float32Array(nodes.length),
    edgeEnergy: new Float32Array(edges.length),
    outgoing,
  };
}

/**
 * Random node firings + short cascades along edges — reads like a network training.
 * Rate rises with pulseEnergy / scrollDepth.
 */
export function tickTrainingSparks(
  sparks: TrainingSparks,
  edges: NeuralEdge[],
  dt: number,
  pulseEnergy: number,
  scrollDepth: number,
): void {
  const { nodeEnergy, edgeEnergy, outgoing } = sparks;
  const decay = Math.exp(-dt * (3.2 + pulseEnergy * 1.4));
  for (let i = 0; i < nodeEnergy.length; i++) nodeEnergy[i] *= decay;
  for (let i = 0; i < edgeEnergy.length; i++) edgeEnergy[i] *= decay;

  // Stochastic firings — more frequent deeper in the page
  // Stochastic firings — calm surface, busier deeper; still reads as training
  const fireChance = (0.35 + pulseEnergy * 1.4 + scrollDepth * 1.0) * dt;
  const bursts = Math.random() < 0.35 + pulseEnergy * 0.3 ? 2 : 1;
  for (let b = 0; b < bursts; b++) {
    if (Math.random() > fireChance) continue;
    const i = (Math.random() * nodeEnergy.length) | 0;
    nodeEnergy[i] = Math.max(nodeEnergy[i], 0.75 + Math.random() * 0.25);

    // Forward cascade along a few outgoing edges
    const outs = outgoing[i];
    const nCascade = Math.min(outs.length, 1 + ((Math.random() * 2) | 0));
    for (let k = 0; k < nCascade; k++) {
      const ei = outs[(Math.random() * outs.length) | 0];
      if (ei == null) continue;
      edgeEnergy[ei] = Math.max(edgeEnergy[ei], 0.7 + Math.random() * 0.3);
      const tgt = edges[ei].b;
      nodeEnergy[tgt] = Math.max(nodeEnergy[tgt], 0.45 + Math.random() * 0.4);
    }
  }

  // Occasional reverse "backprop" flash on a hot edge
  if (Math.random() < (0.15 + pulseEnergy * 0.35) * dt * 8) {
    const ei = (Math.random() * edges.length) | 0;
    if (edgeEnergy[ei] > 0.2 || Math.random() < 0.25) {
      edgeEnergy[ei] = Math.max(edgeEnergy[ei], 0.85);
      nodeEnergy[edges[ei].a] = Math.max(nodeEnergy[edges[ei].a], 0.55);
      nodeEnergy[edges[ei].b] = Math.max(nodeEnergy[edges[ei].b], 0.55);
    }
  }
}

export function driftedPosition(
  node: NeuralNode,
  time: number,
  amplitude: number,
): { x: number; y: number; z: number } {
  const t = time * node.speed + node.phase;
  return {
    x: node.x + Math.sin(t * 0.7) * amplitude * 0.45,
    y: node.y + Math.cos(t * 0.9) * amplitude * 0.35,
    z: node.z + Math.sin(t * 0.55 + 0.8) * amplitude * 0.4,
  };
}

/** Soft circular sprite for PointsMaterial (avoids square points). */
export function createCircleSpriteTexture(
  makeCanvas: () => HTMLCanvasElement | OffscreenCanvas = () => document.createElement("canvas"),
): { canvas: HTMLCanvasElement | OffscreenCanvas } {
  const size = 64;
  const canvas = makeCanvas();
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) return { canvas };

  ctx.clearRect(0, 0, size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.9)");
  g.addColorStop(0.55, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  return { canvas };
}
