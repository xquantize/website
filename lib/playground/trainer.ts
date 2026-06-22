"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MLP } from "./mlp";
import { Value, type Activation } from "./autograd";
import type { Sample } from "./datasets";

export type TrainerConfig = {
  hiddenSizes: number[];
  activation: Activation;
  learningRate: number;
  dataset: Sample[];
};

export function useTrainer(config: TrainerConfig) {
  const mlpRef = useRef<MLP | null>(null);
  const runningRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const lossHistRef = useRef<number[]>([]);
  const configRef = useRef(config);
  configRef.current = config;
  const [tick, setTick] = useState(0);

  // Rebuild network whenever architecture changes
  const archKey = `${config.hiddenSizes.join(",")}-${config.activation}`;
  useEffect(() => {
    mlpRef.current = new MLP(2, configRef.current.hiddenSizes, configRef.current.activation);
    stepRef.current = 0;
    lossHistRef.current = [];
    setTick((t) => t + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archKey]);

  const trainStep = useCallback((): number => {
    const mlp = mlpRef.current;
    const { dataset, learningRate } = configRef.current;
    if (!mlp || dataset.length === 0) return 0;

    // Hinge loss: max(0, 1 - y*score)
    let totalLoss: Value = new Value(0);
    for (const s of dataset) {
      const score = mlp.forward([s.x, s.y]);
      const hinge = score.mul(s.label).mul(-1).add(1).relu();
      totalLoss = totalLoss.add(hinge);
    }
    const meanLoss = totalLoss.mul(1 / dataset.length);

    // Tiny L2 reg to keep weights tame
    const params = mlp.parameters();
    let reg: Value = new Value(0);
    for (const p of params) reg = reg.add(p.pow(2));
    const total = meanLoss.add(reg.mul(1e-4));

    total.backward();
    for (const p of params) p.data -= learningRate * p.grad;
    return meanLoss.data;
  }, []);

  const loop = useCallback(() => {
    if (!runningRef.current) return;
    const loss = trainStep();
    stepRef.current += 1;
    // Emit ~every other step; tweak for perf
    if (stepRef.current % 1 === 0) {
      lossHistRef.current = [...lossHistRef.current.slice(-119), loss];
      setTick((t) => t + 1);
    }
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
      configRef.current.activation
    );
    stepRef.current = 0;
    lossHistRef.current = [];
    setTick((t) => t + 1);
  }, []);

  const stepOnce = useCallback(() => {
    if (runningRef.current) return;
    const loss = trainStep();
    stepRef.current += 1;
    lossHistRef.current = [...lossHistRef.current.slice(-119), loss];
    setTick((t) => t + 1);
  }, [trainStep]);

  const predict = useCallback((x: number, y: number): number => {
    const mlp = mlpRef.current;
    if (!mlp) return 0;
    return mlp.forward([x, y]).data;
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  return {
    step: stepRef.current,
    loss: lossHistRef.current[lossHistRef.current.length - 1] ?? 0,
    lossHistory: lossHistRef.current,
    running: runningRef.current,
    tick,
    play,
    pause,
    reset,
    stepOnce,
    predict,
  };
}
