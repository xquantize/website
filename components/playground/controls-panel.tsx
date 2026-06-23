"use client";

import type { Activation } from "@/lib/playground/autograd";
import type { DatasetKind } from "@/lib/playground/datasets";
import type { PlaygroundPreset } from "@/lib/playground/presets";
import { PLAYGROUND_PRESETS } from "@/lib/playground/presets";
import { SourcePanel } from "./source-panel";

type Props = {
  hiddenSizes: number[];
  activation: Activation;
  learningRate: number;
  datasetKind: DatasetKind;
  speed: number;
  speeds: readonly number[];
  activePresetId: string | null;
  running: boolean;
  step: number;
  loss: number;
  accuracy: number;
  onHiddenSizes: (s: number[]) => void;
  onActivation: (a: Activation) => void;
  onLearningRate: (lr: number) => void;
  onDatasetKind: (k: DatasetKind) => void;
  onSpeed: (speed: number) => void;
  onPreset: (preset: PlaygroundPreset) => void;
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
  label,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
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
    <aside className="lab-controls" aria-label="Training controls">
      <div className="lab-bar">
        <div
          className="lab-bar__stats font-mono"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
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

        <div className="lab-bar__actions" role="group" aria-label="Playback">
          <button
            type="button"
            onClick={p.onPlayPause}
            aria-pressed={p.running}
            aria-label={p.running ? "Pause training" : "Play training"}
            className="lab-btn lab-btn--primary pointer-events-auto"
          >
            {p.running ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={p.onStep}
            disabled={p.running}
            aria-label="Advance one training step"
            className="lab-btn pointer-events-auto"
          >
            Step
          </button>
          <button
            type="button"
            onClick={p.onReset}
            aria-label="Reset network and dataset"
            className="lab-btn pointer-events-auto"
          >
            Reset
          </button>
        </div>
      </div>

      <fieldset className="lab-field">
        <legend className="lab-field__label font-mono">Presets</legend>
        <div className="lab-options">
          {PLAYGROUND_PRESETS.map((preset) => (
            <LabOption
              key={preset.id}
              active={p.activePresetId === preset.id}
              label={`Load ${preset.label} preset`}
              onClick={() => p.onPreset(preset)}
            >
              {preset.label}
            </LabOption>
          ))}
        </div>
      </fieldset>

      <fieldset className="lab-field">
        <legend className="lab-field__label font-mono">Speed</legend>
        <div className="lab-options" role="group" aria-label="Training speed">
          {p.speeds.map((s) => (
            <LabOption
              key={s}
              active={s === p.speed}
              label={`${s} times speed`}
              onClick={() => p.onSpeed(s)}
            >
              {s}×
            </LabOption>
          ))}
        </div>
      </fieldset>

      <fieldset className="lab-field">
        <legend className="lab-field__label font-mono">Dataset</legend>
        <div className="lab-options" role="group" aria-label="Dataset">
          {DATASETS.map((d) => (
            <LabOption
              key={d}
              active={d === p.datasetKind}
              label={`${d} dataset`}
              onClick={() => p.onDatasetKind(d)}
            >
              {d}
            </LabOption>
          ))}
        </div>
      </fieldset>

      <details className="lab-architecture pointer-events-auto">
        <summary className="lab-architecture__summary font-mono">Architecture</summary>
        <div className="lab-architecture__body">
          <fieldset className="lab-field">
            <legend className="lab-field__label font-mono">Activation</legend>
            <div className="lab-options">
              {ACTIVATIONS.map((a) => (
                <LabOption
                  key={a}
                  active={a === p.activation}
                  label={`${a} activation`}
                  onClick={() => p.onActivation(a)}
                >
                  {a}
                </LabOption>
              ))}
            </div>
          </fieldset>

          <fieldset className="lab-field">
            <legend className="lab-field__label font-mono">Hidden layers</legend>
            <div className="lab-field__head">
              <span className="sr-only">Layer count</span>
              <div className="lab-options lab-options--compact">
                {[1, 2, 3].map((n) => (
                  <LabOption
                    key={n}
                    active={p.hiddenSizes.length === n}
                    label={`${n} hidden layers`}
                    onClick={() => setLayerCount(n)}
                  >
                    {n}
                  </LabOption>
                ))}
              </div>
            </div>
            {p.hiddenSizes.map((size, i) => (
              <div key={i} className="lab-slider-row">
                <label className="lab-slider-row__head" htmlFor={`layer-${i}`}>
                  <span className="lab-field__label font-mono">Layer {i + 1}</span>
                  <span className="lab-slider-row__value font-mono">{size}</span>
                </label>
                <input
                  id={`layer-${i}`}
                  type="range"
                  min={2}
                  max={8}
                  value={size}
                  aria-valuemin={2}
                  aria-valuemax={8}
                  aria-valuenow={size}
                  aria-label={`Layer ${i + 1} neurons`}
                  onChange={(e) => setNeurons(i, parseInt(e.target.value))}
                  className="lab-slider pointer-events-auto"
                />
              </div>
            ))}
          </fieldset>

          <div className="lab-field">
            <div className="lab-slider-row">
              <label className="lab-slider-row__head" htmlFor="learning-rate">
                <span className="lab-field__label font-mono">Learning rate</span>
                <span className="lab-slider-row__value font-mono">
                  {p.learningRate.toFixed(3)}
                </span>
              </label>
              <input
                id="learning-rate"
                type="range"
                min={-3}
                max={0}
                step={0.05}
                value={Math.log10(p.learningRate)}
                aria-valuemin={-3}
                aria-valuemax={0}
                aria-valuenow={Math.log10(p.learningRate)}
                aria-valuetext={p.learningRate.toFixed(3)}
                aria-label="Learning rate"
                onChange={(e) => p.onLearningRate(10 ** parseFloat(e.target.value))}
                className="lab-slider pointer-events-auto"
              />
            </div>
          </div>
        </div>
      </details>

      <SourcePanel />
    </aside>
  );
}
