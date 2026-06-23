"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTrainer } from "@/lib/playground/trainer";
import { makeDataset, type DatasetKind } from "@/lib/playground/datasets";
import type { Activation } from "@/lib/playground/autograd";
import { PLAYGROUND_PRESETS, type PlaygroundPreset } from "@/lib/playground/presets";
import { ControlsPanel } from "./controls-panel";
import { DecisionBoundary } from "./decision-boundary";
import { LossCurve } from "./loss-curve";
import { NetworkDiagram } from "./network-diagram";

const MAX_CANVAS = 560;
const SPEEDS = [1, 4, 16] as const;

function matchesPreset(
  preset: PlaygroundPreset,
  state: {
    hiddenSizes: number[];
    activation: Activation;
    learningRate: number;
    datasetKind: DatasetKind;
    speed: number;
  },
) {
  return (
    preset.datasetKind === state.datasetKind &&
    preset.activation === state.activation &&
    preset.learningRate === state.learningRate &&
    preset.speed === state.speed &&
    preset.hiddenSizes.length === state.hiddenSizes.length &&
    preset.hiddenSizes.every((n, i) => n === state.hiddenSizes[i])
  );
}

type Props = {
  accent?: string;
};

export function Playground({ accent = "#7dd3c0" }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState(480);
  const [hiddenSizes, setHiddenSizes] = useState<number[]>([5, 4]);
  const [activation, setActivation] = useState<Activation>("tanh");
  const [learningRate, setLearningRate] = useState(0.05);
  const [datasetKind, setDatasetKind] = useState<DatasetKind>("circle");
  const [seed, setSeed] = useState(7);
  const [probe, setProbe] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState<number>(4);
  const [manualConfig, setManualConfig] = useState(true);
  const [presetTick, setPresetTick] = useState(0);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    const update = () => {
      setCanvasSize(Math.min(Math.floor(node.clientWidth), MAX_CANVAS));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const dataset = useMemo(
    () => makeDataset(datasetKind, 160, seed),
    [datasetKind, seed],
  );

  const trainer = useTrainer({
    hiddenSizes,
    activation,
    learningRate,
    dataset,
    speed,
  });

  const snapshot = trainer.getSnapshot(probe.x, probe.y);

  const activePresetId = useMemo(() => {
    if (manualConfig) return null;
    const state = { hiddenSizes, activation, learningRate, datasetKind, speed };
    return PLAYGROUND_PRESETS.find((p) => matchesPreset(p, state))?.id ?? null;
  }, [manualConfig, hiddenSizes, activation, learningRate, datasetKind, speed]);

  const markManual = useCallback(() => setManualConfig(true), []);

  const applyPreset = useCallback(
    (preset: PlaygroundPreset) => {
      if (trainer.running) trainer.pause();
      setManualConfig(false);
      setHiddenSizes(preset.hiddenSizes);
      setActivation(preset.activation);
      setLearningRate(preset.learningRate);
      setDatasetKind(preset.datasetKind);
      setSpeed(preset.speed);
      setSeed((s) => s + 1);
      setPresetTick((t) => t + 1);
    },
    [trainer],
  );

  useEffect(() => {
    if (presetTick === 0) return;
    trainer.reset();
  }, [presetTick, trainer]);

  return (
    <div className="lab" style={{ "--project-accent": accent } as React.CSSProperties}>
      <div className="lab__layout">
        <div ref={stageRef} className="lab__stage">
          <DecisionBoundary
            predict={trainer.predict}
            samples={dataset}
            tick={trainer.tick}
            size={canvasSize}
            probe={probe}
            accent={accent}
            onProbe={setProbe}
          />
          <LossCurve
            history={trainer.lossHistory}
            width={canvasSize}
            height={44}
          />
          <NetworkDiagram
            snapshot={snapshot}
            running={trainer.running}
            width={canvasSize}
          />
        </div>

        <ControlsPanel
          hiddenSizes={hiddenSizes}
          activation={activation}
          learningRate={learningRate}
          datasetKind={datasetKind}
          speed={speed}
          speeds={SPEEDS}
          activePresetId={activePresetId}
          running={trainer.running}
          step={trainer.step}
          loss={trainer.loss}
          accuracy={trainer.accuracy}
          onHiddenSizes={(s) => {
            markManual();
            setHiddenSizes(s);
          }}
          onActivation={(a) => {
            markManual();
            setActivation(a);
          }}
          onLearningRate={(lr) => {
            markManual();
            setLearningRate(lr);
          }}
          onDatasetKind={(k) => {
            markManual();
            setDatasetKind(k);
          }}
          onSpeed={(s) => {
            markManual();
            setSpeed(s);
          }}
          onPreset={applyPreset}
          onPlayPause={() => (trainer.running ? trainer.pause() : trainer.play())}
          onReset={() => {
            markManual();
            trainer.reset();
            setSeed((s) => s + 1);
          }}
          onStep={trainer.stepOnce}
        />
      </div>
    </div>
  );
}
