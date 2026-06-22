"use client";

import type { Activation } from "@/lib/playground/autograd";
import type { DatasetKind } from "@/lib/playground/datasets";

type Props = {
  hiddenSizes: number[];
  activation: Activation;
  learningRate: number;
  datasetKind: DatasetKind;
  speed: number;
  speeds: readonly number[];
  running: boolean;
  step: number;
  loss: number;
  accuracy: number;
  onHiddenSizes: (s: number[]) => void;
  onActivation: (a: Activation) => void;
  onLearningRate: (lr: number) => void;
  onDatasetKind: (k: DatasetKind) => void;
  onSpeed: (speed: number) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onStep: () => void;
};

const DATASETS: DatasetKind[] = ["xor", "circle", "gaussian", "spiral"];
const ACTIVATIONS: Activation[] = ["tanh", "relu", "sigmoid"];

function LabOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`lab-option pointer-events-auto${active ? " is-active" : ""}`}
    >
      {children}
    </button>
  );
}

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
    <div className="lab-controls">
      <div className="lab-bar">
        <div className="lab-bar__stats font-mono">
          <span>
            <span className="lab-bar__label">step</span>
            {p.step.toString().padStart(5, "0")}
          </span>
          <span>
            <span className="lab-bar__label">acc</span>
            {(p.accuracy * 100).toFixed(0)}%
          </span>
          <span>
            <span className="lab-bar__label">loss</span>
            {p.loss.toFixed(4)}
          </span>
        </div>

        <div className="lab-bar__actions">
          <button
            type="button"
            onClick={p.onPlayPause}
            className="lab-btn lab-btn--primary pointer-events-auto"
          >
            {p.running ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={p.onStep}
            disabled={p.running}
            className="lab-btn pointer-events-auto"
          >
            Step
          </button>
          <button type="button" onClick={p.onReset} className="lab-btn pointer-events-auto">
            Reset
          </button>
        </div>
      </div>

      <div className="lab-field">
        <span className="lab-field__label font-mono">Speed</span>
        <div className="lab-options">
          {p.speeds.map((s) => (
            <LabOption key={s} active={s === p.speed} onClick={() => p.onSpeed(s)}>
              {s}×
            </LabOption>
          ))}
        </div>
      </div>

      <div className="lab-field">
        <span className="lab-field__label font-mono">Dataset</span>
        <div className="lab-options">
          {DATASETS.map((d) => (
            <LabOption
              key={d}
              active={d === p.datasetKind}
              onClick={() => p.onDatasetKind(d)}
            >
              {d}
            </LabOption>
          ))}
        </div>
      </div>

      <details className="lab-architecture pointer-events-auto">
        <summary className="lab-architecture__summary font-mono">Architecture</summary>
        <div className="lab-architecture__body">
          <div className="lab-field">
            <span className="lab-field__label font-mono">Activation</span>
            <div className="lab-options">
              {ACTIVATIONS.map((a) => (
                <LabOption
                  key={a}
                  active={a === p.activation}
                  onClick={() => p.onActivation(a)}
                >
                  {a}
                </LabOption>
              ))}
            </div>
          </div>

          <div className="lab-field">
            <div className="lab-field__head">
              <span className="lab-field__label font-mono">Hidden layers</span>
              <div className="lab-options lab-options--compact">
                {[1, 2, 3].map((n) => (
                  <LabOption
                    key={n}
                    active={p.hiddenSizes.length === n}
                    onClick={() => setLayerCount(n)}
                  >
                    {n}
                  </LabOption>
                ))}
              </div>
            </div>
            {p.hiddenSizes.map((size, i) => (
              <div key={i} className="lab-slider-row">
                <div className="lab-slider-row__head">
                  <span className="lab-field__label font-mono">Layer {i + 1}</span>
                  <span className="lab-slider-row__value font-mono">{size}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={8}
                  value={size}
                  onChange={(e) => setNeurons(i, parseInt(e.target.value))}
                  className="lab-slider pointer-events-auto"
                />
              </div>
            ))}
          </div>

          <div className="lab-field">
            <div className="lab-slider-row">
              <div className="lab-slider-row__head">
                <span className="lab-field__label font-mono">Learning rate</span>
                <span className="lab-slider-row__value font-mono">
                  {p.learningRate.toFixed(3)}
                </span>
              </div>
              <input
                type="range"
                min={-3}
                max={0}
                step={0.05}
                value={Math.log10(p.learningRate)}
                onChange={(e) => p.onLearningRate(10 ** parseFloat(e.target.value))}
                className="lab-slider pointer-events-auto"
              />
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
