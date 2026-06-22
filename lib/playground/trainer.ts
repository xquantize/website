"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MLP } from "./mlp";
import { Value } from "./autograd";
import type { Sample } from "./datasets";
import type { NetworkSnapshot } from "./network-snapshot";

export type TrainerConfig = {
  hiddenSizes: number[];
  activation: import("./autograd").Activation;
  learningRate: number;
  dataset: Sample[];
  speed?: number;
};

export function useTrainer(config: TrainerConfig) {
  const mlpRef = useRef<MLP | null>(null);
  const runningRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const lossHistRef = useRef<number[]>([]);
  const accuracyRef = useRef(0);
  const configRef = useRef(config);
  configRef.current = config;
  const [tick, setTick] = useState(0);

  const archKey = `${config.hiddenSizes.join(",")}-${config.activation}`;
  useEffect(() => {
    mlpRef.current = new MLP(2, configRef.current.hiddenSizes, configRef.current.activation);
    stepRef.current = 0;
    lossHistRef.current = [];
    accuracyRef.current = 0;
    setTick((t) => t + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archKey]);

  const computeAccuracy = useCallback((mlp: MLP, dataset: Sample[]) => {
    let correct = 0;
    for (const s of dataset) {
      const score = mlp.forward([s.x, s.y]).data;
      if ((score >= 0 ? 1 : -1) === s.label) correct++;
    }
    return correct / dataset.length;
  }, []);

  const trainStep = useCallback((): { loss: number; accuracy: number } => {
    const mlp = mlpRef.current;
    const { dataset, learningRate } = configRef.current;
    if (!mlp || dataset.length === 0) return { loss: 0, accuracy: 0 };

    let totalLoss: Value = new Value(0);
    for (const s of dataset) {
      const score = mlp.forward([s.x, s.y]);
      const hinge = score.mul(s.label).mul(-1).add(1).relu();
      totalLoss = totalLoss.add(hinge);
    }
    const meanLoss = totalLoss.mul(1 / dataset.length);

    const params = mlp.parameters();
    let reg: Value = new Value(0);
    for (const p of params) reg = reg.add(p.pow(2));
    const total = meanLoss.add(reg.mul(1e-4));

    total.backward();
    for (const p of params) p.data -= learningRate * p.grad;
    return { loss: meanLoss.data, accuracy: computeAccuracy(mlp, dataset) };
  }, [computeAccuracy]);

  const loop = useCallback(() => {
    if (!runningRef.current) return;
    const speed = Math.max(1, configRef.current.speed ?? 1);
    let loss = 0;
    let accuracy = 0;
    for (let i = 0; i < speed; i++) {
      ({ loss, accuracy } = trainStep());
      stepRef.current += 1;
    }
    lossHistRef.current = [...lossHistRef.current.slice(-119), loss];
    accuracyRef.current = accuracy;
    setTick((t) => t + 1);
    rafRef.current = requestAnimationFrame(loop);
  }, [trainStep]);

  const play = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(loop);
    setTick((t) => t + 1);
  }, [loop]);

  const pause = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTick((t) => t + 1);
  }, []);

  const reset = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    mlpRef.current = new MLP(
      2,
      configRef.current.hiddenSizes,
      configRef.current.activation,
    );
    stepRef.current = 0;
    lossHistRef.current = [];
    accuracyRef.current = 0;
    setTick((t) => t + 1);
  }, []);

  const stepOnce = useCallback(() => {
    if (runningRef.current) return;
    const { loss, accuracy } = trainStep();
    stepRef.current += 1;
    lossHistRef.current = [...lossHistRef.current.slice(-119), loss];
    accuracyRef.current = accuracy;
    setTick((t) => t + 1);
  }, [trainStep]);

  const predict = useCallback((x: number, y: number): number => {
    const mlp = mlpRef.current;
    if (!mlp) return 0;
    return mlp.forward([x, y]).data;
  }, []);

  const getSnapshot = useCallback((x: number, y: number): NetworkSnapshot | null => {
    const mlp = mlpRef.current;
    if (!mlp) return null;
    const { activations, output } = mlp.forwardTrace([x, y]);
    return {
      sizes: [2, ...configRef.current.hiddenSizes, 1],
      activations,
      weights: mlp.exportWeights(),
      weightGrads: mlp.exportWeightGrads(),
      biasGrads: mlp.exportBiasGrads(),
      output: output.data,
    };
  }, [tick, archKey]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return {
    step: stepRef.current,
    loss: lossHistRef.current[lossHistRef.current.length - 1] ?? 0,
    accuracy: accuracyRef.current,
    lossHistory: lossHistRef.current,
    running: runningRef.current,
    tick,
    play,
    pause,
    reset,
    stepOnce,
    predict,
    getSnapshot,
  };
}
