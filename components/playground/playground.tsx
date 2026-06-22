"use client";

import { useMemo, useState } from "react";
import { useTrainer } from "@/lib/playground/trainer";
import { makeDataset, type DatasetKind } from "@/lib/playground/datasets";
import type { Activation } from "@/lib/playground/autograd";
import { ControlsPanel } from "./controls-panel";
import { DecisionBoundary } from "./decision-boundary";
import { LossCurve } from "./loss-curve";

export function Playground() {
  const [hiddenSizes, setHiddenSizes] = useState<number[]>([5, 4]);
  const [activation, setActivation] = useState<Activation>("tanh");
  const [learningRate, setLearningRate] = useState(0.05);
  const [datasetKind, setDatasetKind] = useState<DatasetKind>("circle");
  const [seed, setSeed] = useState(7);

  const dataset = useMemo(
    () => makeDataset(datasetKind, 160, seed),
    [datasetKind, seed]
  );

  const trainer = useTrainer({
    hiddenSizes,
    activation,
    learningRate,
    dataset,
  });

  return (
    <div className="grid md:grid-cols-[480px_1fr] gap-16 items-start">
      <div className="flex flex-col gap-4">
        <DecisionBoundary
          predict={trainer.predict}
          samples={dataset}
          tick={trainer.tick}
        />
        <LossCurve history={trainer.lossHistory} width={480} height={50} />
      </div>

      <ControlsPanel
        hiddenSizes={hiddenSizes}
        activation={activation}
        learningRate={learningRate}
        datasetKind={datasetKind}
        running={trainer.running}
        step={trainer.step}
        loss={trainer.loss}
        onHiddenSizes={setHiddenSizes}
        onActivation={setActivation}
        onLearningRate={setLearningRate}
        onDatasetKind={setDatasetKind}
        onPlayPause={() => (trainer.running ? trainer.pause() : trainer.play())}
        onReset={() => {
          trainer.reset();
          setSeed((s) => s + 1);
        }}
        onStep={trainer.stepOnce}
      />
    </div>
  );
}
