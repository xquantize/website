import type { Activation } from "./autograd";
import type { DatasetKind } from "./datasets";

export type PlaygroundPreset = {
  id: string;
  label: string;
  datasetKind: DatasetKind;
  hiddenSizes: number[];
  activation: Activation;
  learningRate: number;
  speed: number;
};

export const PLAYGROUND_PRESETS: PlaygroundPreset[] = [
  {
    id: "spiral",
    label: "Spiral",
    datasetKind: "spiral",
    hiddenSizes: [6, 5, 4],
    activation: "tanh",
    learningRate: 0.08,
    speed: 16,
  },
  {
    id: "xor",
    label: "XOR",
    datasetKind: "xor",
    hiddenSizes: [4],
    activation: "tanh",
    learningRate: 0.1,
    speed: 8,
  },
];
