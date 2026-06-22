"use client";

import type { Activation } from "@/lib/playground/autograd";
import type { DatasetKind } from "@/lib/playground/datasets";

type Props = {
  hiddenSizes: number[];
  activation: Activation;
  learningRate: number;
  datasetKind: DatasetKind;
  running: boolean;
  step: number;
  loss: number;
  onHiddenSizes: (s: number[]) => void;
  onActivation: (a: Activation) => void;
  onLearningRate: (lr: number) => void;
  onDatasetKind: (k: DatasetKind) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onStep: () => void;
};

const DATASETS: DatasetKind[] = ["xor", "circle", "gaussian", "spiral"];
const ACTIVATIONS: Activation[] = ["tanh", "relu", "sigmoid"];

const labelCls =
  "font-mono text-[0.65rem] tracking-[0.15em] uppercase opacity-40";
const valueCls = "font-mono text-[0.75rem] opacity-75";
const btnCls =
  "font-mono text-[0.7rem] tracking-[0.15em] uppercase site-link pointer-events-auto";

export function ControlsPanel(p: Props) {
  const setLayerCount = (n: number) => {
    const next = [...p.hiddenSizes];
    while (next.length < n) next.push(4);
    while (next.length > n) next.pop();
    p.onHiddenSizes(next);
  };

  const setNeurons = (i: number, n: number) => {
    const next = [...p.hiddenSizes];
    next[i] = Math.max(2, Math.min(8, n));
    p.onHiddenSizes(next);
  };

  return (
    <div className="flex flex-col gap-10 max-w-xs">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <span className={labelCls}>step</span>
          <span className={valueCls}>
            {p.step.toString().padStart(5, "0")}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className={labelCls}>loss</span>
          <span className={valueCls}>{p.loss.toFixed(4)}</span>
        </div>
      </div>

      <div className="flex gap-5">
        <button onClick={p.onPlayPause} className={btnCls}>
          {p.running ? "pause" : "play"}
        </button>
        <button
          onClick={p.onStep}
          disabled={p.running}
          className={btnCls}
          style={{ opacity: p.running ? 0.2 : undefined }}
        >
          step
        </button>
        <button onClick={p.onReset} className={btnCls}>
          reset
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <span className={labelCls}>dataset</span>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {DATASETS.map((d) => (
            <button
              key={d}
              onClick={() => p.onDatasetKind(d)}
              className="font-mono text-[0.7rem] tracking-[0.1em] uppercase pointer-events-auto transition-opacity"
              style={{ opacity: d === p.datasetKind ? 1 : 0.35 }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className={labelCls}>activation</span>
        <div className="flex gap-4">
          {ACTIVATIONS.map((a) => (
            <button
              key={a}
              onClick={() => p.onActivation(a)}
              className="font-mono text-[0.7rem] tracking-[0.1em] uppercase pointer-events-auto"
              style={{ opacity: a === p.activation ? 1 : 0.35 }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between">
          <span className={labelCls}>hidden layers</span>
          <span className={valueCls}>{p.hiddenSizes.length}</span>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setLayerCount(n)}
              className="font-mono text-[0.75rem] pointer-events-auto"
              style={{ opacity: p.hiddenSizes.length === n ? 1 : 0.35 }}
            >
              {n}
            </button>
          ))}
        </div>
        {p.hiddenSizes.map((size, i) => (
          <div key={i} className="flex flex-col gap-1.5 mt-1">
            <div className="flex justify-between">
              <span className={labelCls}>layer {i + 1}</span>
              <span className={valueCls}>{size} neurons</span>
            </div>
            <input
              type="range"
              min={2}
              max={8}
              value={size}
              onChange={(e) => setNeurons(i, parseInt(e.target.value))}
              className="playground-slider pointer-events-auto"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <span className={labelCls}>learning rate</span>
          <span className={valueCls}>{p.learningRate.toFixed(3)}</span>
        </div>
        <input
          type="range"
          min={-3}
          max={0}
          step={0.05}
          value={Math.log10(p.learningRate)}
          onChange={(e) =>
            p.onLearningRate(10 ** parseFloat(e.target.value))
          }
          className="playground-slider pointer-events-auto"
        />
      </div>
    </div>
  );
}
