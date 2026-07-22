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
  /** Connection strength 0.2–1 (visual thickness + pulse gain) */
  weight: number;
  /** +1 excitatory / −1 inhibitory */
  sign: 1 | -1;
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
  /** Fraction of hidden neurons silenced each forward batch */
  dropout: number;
};

/**
 * Desktop WebGL — classic teaching MLP (3 inputs, fully connected layers).
 * Spacing uses equal neuron pitch so it reads like a textbook diagram.
 */
export const NEURAL_FIELD: Record<QualityTier, LayeredNetworkConfig> = {
  high: {
    layers: [3, 5, 4, 2],
    linksPerNode: 8,
    maxWaves: 1,
    columnWidth: 4.4,
    height: 11.5,
    depthJitter: 0,
    dropout: 0.22,
  },
  medium: {
    layers: [3, 5, 2],
    linksPerNode: 8,
    maxWaves: 1,
    columnWidth: 4.0,
    height: 9.5,
    depthJitter: 0,
    dropout: 0.2,
  },
  low: {
    layers: [3, 4, 2],
    linksPerNode: 8,
    maxWaves: 1,
    columnWidth: 3.6,
    height: 8,
    depthJitter: 0,
    dropout: 0.18,
  },
};

/** Mobile / low-tier Canvas2D — same classic 3-in diagram */
export const NEURAL_FALLBACK: LayeredNetworkConfig = {
  layers: [3, 5, 2],
  linksPerNode: 8,
  maxWaves: 1,
  columnWidth: 1,
  height: 1,
  depthJitter: 0,
  dropout: 0.2,
};

export type LayeredNetwork = {
  nodes: NeuralNode[];
  edges: NeuralEdge[];
  layerCount: number;
  layerStarts: number[];
  layerEnds: number[];
  layerLabels: string[];
  dropout: number;
};

/** in / h1 / h2 / … / out */
export function layerLabel(index: number, layerCount: number): string {
  if (index === 0) return "in";
  if (index === layerCount - 1) return "out";
  return `h${index}`;
}

/**
 * Build a classic MLP diagram: equal neuron pitch within layers (centered),
 * equal layer spacing top→bottom, dense adjacent-layer connections.
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
  const layerLabels = Array.from({ length: layerCount }, (_, i) =>
    layerLabel(i, layerCount),
  );
  const maxCount = Math.max(...cfg.layers, 2);

  for (let L = 0; L < layerCount; L++) {
    const count = cfg.layers[L];
    layerStarts.push(nodes.length);
    // 0 = top, 1 = bottom — equal gaps between layers
    const t = layerCount === 1 ? 0.5 : L / (layerCount - 1);

    for (let i = 0; i < count; i++) {
      // Equal pitch across the widest layer; narrower layers stay centered
      const pitch = 1 / (maxCount - 1);
      const span = (count - 1) * pitch;
      const u = count === 1 ? 0.5 : 0.5 - span / 2 + i * pitch;

      if (normalized2d) {
        nodes.push({
          x: 0.58 + (u - 0.5) * 0.5,
          y: 0.14 + t * 0.72,
          z: 0,
          layer: L,
          phase: rng() * Math.PI * 2,
          speed: 0.08 + rng() * 0.12,
        });
      } else {
        nodes.push({
          x: (u - 0.5) * cfg.columnWidth,
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
    const nextCount = b1 - b0;

    // Fully (or nearly) connected between adjacent layers — textbook look
    for (let i = a0; i < a1; i++) {
      const srcX = nodes[i].x;
      const ranked: { j: number; d: number }[] = [];
      for (let j = b0; j < b1; j++) {
        ranked.push({ j, d: Math.abs(nodes[j].x - srcX) });
      }
      ranked.sort((a, b) => a.d - b.d || a.j - b.j);
      const nLinks = Math.min(cfg.linksPerNode, nextCount, ranked.length);
      for (let k = 0; k < nLinks; k++) {
        // Closer (aligned) connections slightly stronger; few inhibitory
        const proximity = 1 - k / Math.max(1, nLinks - 1 || 1);
        const weight = Math.min(1, 0.35 + proximity * 0.45 + rng() * 0.2);
        const sign: 1 | -1 = rng() < 0.12 ? -1 : 1;
        edges.push({
          a: i,
          b: ranked[k].j,
          fromLayer: L,
          toLayer: L + 1,
          weight,
          sign,
        });
      }
    }
  }

  return {
    nodes,
    edges,
    layerCount,
    layerStarts,
    layerEnds,
    layerLabels,
    dropout: cfg.dropout,
  };
}

export function createWavePool(maxWaves: number): ActivationWave[] {
  return Array.from({ length: maxWaves }, () => ({
    front: 0,
    speed: 1,
    active: false,
  }));
}

/** Spawn interval — quieter sweeps, still drifts with scroll depth */
export function waveSpawnInterval(scrollDepth: number): number {
  return 4.2 - scrollDepth * 1.4;
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

/** Per-neuron / synapse activity — spikes, traveling pulses, forward passes */
export type SynapsePulse = {
  edge: number;
  /** 0 at pre-synaptic, 1 at post-synaptic */
  t: number;
  speed: number;
  active: boolean;
  /** 1 = forward, -1 = backprop-style */
  dir: 1 | -1;
};

export type NeuralActivity = {
  /** Instantaneous membrane / activation 0–1 */
  nodeEnergy: Float32Array;
  /** Lingering synapse glow after a pulse passes */
  edgeEnergy: Float32Array;
  /** 1 = silenced this batch (hidden layers only) */
  dropped: Uint8Array;
  outgoing: number[][];
  incoming: number[][];
  pulses: SynapsePulse[];
  /** Ring cursor for O(1)-ish free pulse slot search */
  pulseCursor: number;
  /** Layer index arrays for batch input firing */
  layerStarts: number[];
  layerEnds: number[];
  layerCount: number;
  dropout: number;
  batchTimer: number;
  sparseTimer: number;
};

export function createNeuralActivity(
  nodes: NeuralNode[],
  edges: NeuralEdge[],
  layerStarts: number[],
  layerEnds: number[],
  maxPulses = 48,
  dropout = 0.2,
): NeuralActivity {
  const outgoing: number[][] = Array.from({ length: nodes.length }, () => []);
  const incoming: number[][] = Array.from({ length: nodes.length }, () => []);
  for (let i = 0; i < edges.length; i++) {
    outgoing[edges[i].a].push(i);
    incoming[edges[i].b].push(i);
  }
  return {
    nodeEnergy: new Float32Array(nodes.length),
    edgeEnergy: new Float32Array(edges.length),
    dropped: new Uint8Array(nodes.length),
    outgoing,
    incoming,
    pulses: Array.from({ length: maxPulses }, () => ({
      edge: 0,
      t: 0,
      speed: 1,
      active: false,
      dir: 1,
    })),
    pulseCursor: 0,
    layerStarts: layerStarts.slice(),
    layerEnds: layerEnds.slice(),
    layerCount: layerStarts.length,
    dropout,
    batchTimer: 0.6,
    sparseTimer: 0.2,
  };
}

/** Silence a random fraction of hidden neurons for the next forward batch. */
export function resampleDropout(activity: NeuralActivity): void {
  const { dropped, layerStarts, layerEnds, layerCount, dropout } = activity;
  dropped.fill(0);
  if (dropout <= 0 || layerCount < 3) return;
  for (let L = 1; L < layerCount - 1; L++) {
    for (let i = layerStarts[L]; i < layerEnds[L]; i++) {
      if (Math.random() < dropout) dropped[i] = 1;
    }
  }
}

function spawnPulse(
  activity: NeuralActivity,
  edge: number,
  dir: 1 | -1,
  speed: number,
): void {
  const { pulses } = activity;
  const n = pulses.length;
  for (let i = 0; i < n; i++) {
    const idx = (activity.pulseCursor + i) % n;
    const slot = pulses[idx];
    if (slot.active) continue;
    slot.active = true;
    slot.edge = edge;
    slot.t = dir === 1 ? 0 : 1;
    slot.speed = speed;
    slot.dir = dir;
    activity.pulseCursor = (idx + 1) % n;
    return;
  }
}

/** ReLU-style: only positive activations register; dropped units stay silent. */
function spikeNeuron(activity: NeuralActivity, i: number, strength = 1): boolean {
  if (activity.dropped[i]) return false;
  if (strength <= 0) return false;
  activity.nodeEnergy[i] = Math.max(activity.nodeEnergy[i], Math.min(1, strength));
  return true;
}

/**
 * Realistic-ish activity:
 * - ReLU: only excitatory (positive) post-synaptic activations fire
 * - Dropout: randomly silence a fraction of hidden units each batch
 * - Fast spike / exponential decay on neurons
 * - Synaptic pulses travel along edges and recruit the next cell
 * - Periodic input-layer "batch" → cascade as a forward pass
 * - Sparse spontaneous spikes + occasional reverse (backprop) flashes
 */
export function tickNeuralActivity(
  activity: NeuralActivity,
  edges: NeuralEdge[],
  dt: number,
  pulseEnergy: number,
  scrollDepth: number,
): void {
  const {
    nodeEnergy,
    edgeEnergy,
    dropped,
    outgoing,
    pulses,
    layerStarts,
    layerEnds,
    layerCount,
  } = activity;

  // Membrane decay (faster fade = quieter field) + residual synapse glow
  const nodeDecay = Math.exp(-dt * (5.8 + pulseEnergy * 1.0));
  const edgeDecay = Math.exp(-dt * (3.2 + pulseEnergy * 0.7));
  for (let i = 0; i < nodeEnergy.length; i++) {
    if (dropped[i]) {
      nodeEnergy[i] *= nodeDecay * 0.85;
      continue;
    }
    nodeEnergy[i] *= nodeDecay;
  }
  for (let i = 0; i < edgeEnergy.length; i++) edgeEnergy[i] *= edgeDecay;

  // Advance traveling pulses
  for (const p of pulses) {
    if (!p.active) continue;
    p.t += dt * p.speed * p.dir;
    const e = edges[p.edge];
    // Brighten edge while pulse is on it (stronger weights glow more)
    const along = p.dir === 1 ? p.t : 1 - p.t;
    const bell = Math.sin(Math.min(1, Math.max(0, along)) * Math.PI);
    edgeEnergy[p.edge] = Math.max(
      edgeEnergy[p.edge],
      (0.18 + bell * 0.45) * (0.5 + e.weight * 0.4),
    );

    const reached = p.dir === 1 ? p.t >= 1 : p.t <= 0;
    if (reached) {
      p.active = false;
      const post = p.dir === 1 ? e.b : e.a;
      // Signed weight × pulse → ReLU gate (inhibitory edges don't fire)
      const raw = e.sign * e.weight * (0.45 + Math.random() * 0.25);
      if (!spikeNeuron(activity, post, raw)) continue;

      const nextEdges = p.dir === 1 ? outgoing[post] : activity.incoming[post];
      if (nextEdges.length && Math.random() < 0.28 + pulseEnergy * 0.2) {
        const ei = nextEdges[(Math.random() * nextEdges.length) | 0];
        const nextNode = p.dir === 1 ? edges[ei].b : edges[ei].a;
        if (dropped[nextNode]) continue;
        spawnPulse(
          activity,
          ei,
          p.dir,
          (1.8 + Math.random() * 1.0) *
            (0.85 + pulseEnergy * 0.25) *
            (0.75 + edges[ei].weight * 0.35),
        );
      }
    }
  }

  const fireOut = (nodeIndex: number, strength: number) => {
    if (!spikeNeuron(activity, nodeIndex, strength)) return;
    const outs = outgoing[nodeIndex];
    if (!outs.length) return;
    // Quiet fan-out — at most 2 synapses per spike
    let fired = 0;
    const start = (Math.random() * outs.length) | 0;
    for (let k = 0; k < outs.length && fired < 2; k++) {
      const ei = outs[(start + k) % outs.length];
      const e = edges[ei];
      if (e.sign < 0) continue;
      if (dropped[e.b]) continue;
      if (Math.random() < 0.4 + pulseEnergy * 0.15 + e.weight * 0.1) {
        spawnPulse(
          activity,
          ei,
          1,
          (1.7 + Math.random() * 1.0) *
            (0.9 + pulseEnergy * 0.2) *
            (0.75 + e.weight * 0.35),
        );
        fired++;
      }
    }
  };

  // --- Forward pass: quieter batches, often a single input neuron ---
  activity.batchTimer -= dt;
  const batchInterval = 4.0 - scrollDepth * 0.9 - pulseEnergy * 0.35;
  if (activity.batchTimer <= 0) {
    activity.batchTimer = batchInterval * (0.9 + Math.random() * 0.55);
    resampleDropout(activity);
    const a0 = layerStarts[0];
    const a1 = layerEnds[0];
    const batchSize = Math.random() < 0.55 ? 1 : 2;
    for (let n = 0; n < batchSize; n++) {
      fireOut(a0 + ((Math.random() * (a1 - a0)) | 0), 0.55 + Math.random() * 0.25);
    }
  }

  // --- Rare spontaneous spikes ---
  activity.sparseTimer -= dt;
  if (activity.sparseTimer <= 0) {
    activity.sparseTimer = (0.85 - pulseEnergy * 0.2) * (0.85 + Math.random());
    if (Math.random() < 0.28 + pulseEnergy * 0.15) {
      const i = (Math.random() * nodeEnergy.length) | 0;
      if (!dropped[i]) fireOut(i, 0.35 + Math.random() * 0.25);
    }
  }

  // --- Occasional backprop flash (rare) ---
  if (Math.random() < (0.015 + pulseEnergy * 0.03) * dt * 6) {
    const L = layerCount - 1;
    const b0 = layerStarts[L];
    const b1 = layerEnds[L];
    const i = b0 + ((Math.random() * (b1 - b0)) | 0);
    if (spikeNeuron(activity, i, 0.55)) {
      const ins = activity.incoming[i];
      if (ins.length) {
        spawnPulse(activity, ins[(Math.random() * ins.length) | 0], -1, 2.0 + Math.random());
      }
    }
  }
}

/** @deprecated use createNeuralActivity / tickNeuralActivity */
export type TrainingSparks = NeuralActivity;

export function createTrainingSparks(
  nodes: NeuralNode[],
  edges: NeuralEdge[],
): NeuralActivity {
  // Fallback path without layer meta — treat as single layer
  return createNeuralActivity(nodes, edges, [0], [nodes.length], 32, 0);
}

export function tickTrainingSparks(
  sparks: NeuralActivity,
  edges: NeuralEdge[],
  dt: number,
  pulseEnergy: number,
  scrollDepth: number,
): void {
  tickNeuralActivity(sparks, edges, dt, pulseEnergy, scrollDepth);
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

/** Soft circular sprite — bright soma core + soft dendritic halo. */
export function createCircleSpriteTexture(
  makeCanvas: () => HTMLCanvasElement | OffscreenCanvas = () => document.createElement("canvas"),
): { canvas: HTMLCanvasElement | OffscreenCanvas } {
  const size = 96;
  const canvas = makeCanvas();
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) return { canvas };

  ctx.clearRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2;

  // Outer halo
  const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  halo.addColorStop(0, "rgba(255,255,255,0)");
  halo.addColorStop(0.35, "rgba(255,255,255,0.15)");
  halo.addColorStop(0.65, "rgba(255,255,255,0.45)");
  halo.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  // Soma core
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.28);
  core.addColorStop(0, "rgba(255,255,255,1)");
  core.addColorStop(0.4, "rgba(255,255,255,0.95)");
  core.addColorStop(0.75, "rgba(255,255,255,0.35)");
  core.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  return { canvas };
}

/** Tiny monospace label sprite for layer tags (in / h1 / out). */
export function createLayerLabelTexture(
  label: string,
  makeCanvas: () => HTMLCanvasElement | OffscreenCanvas = () => document.createElement("canvas"),
): { canvas: HTMLCanvasElement | OffscreenCanvas } {
  const canvas = makeCanvas();
  canvas.width = 96;
  canvas.height = 48;
  const ctx = canvas.getContext("2d") as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) return { canvas };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "600 22px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(196, 164, 132, 0.55)";
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 1);
  return { canvas };
}
