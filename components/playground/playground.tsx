"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTrainer } from "@/lib/playground/trainer";
import { makeDataset, type DatasetKind } from "@/lib/playground/datasets";
import type { Activation } from "@/lib/playground/autograd";
import { ControlsPanel } from "./controls-panel";
import { DecisionBoundary } from "./decision-boundary";
import { LossCurve } from "./loss-curve";
import { NetworkDiagram } from "./network-diagram";

const MAX_CANVAS = 560;
const SPEEDS = [1, 4, 16] as const;

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
          running={trainer.running}
          step={trainer.step}
          loss={trainer.loss}
          accuracy={trainer.accuracy}
          onHiddenSizes={setHiddenSizes}
          onActivation={setActivation}
          onLearningRate={setLearningRate}
          onDatasetKind={setDatasetKind}
          onSpeed={setSpeed}
          onPlayPause={() => (trainer.running ? trainer.pause() : trainer.play())}
          onReset={() => {
            trainer.reset();
            setSeed((s) => s + 1);
          }}
          onStep={trainer.stepOnce}
        />
      </div>
    </div>
  );
}
