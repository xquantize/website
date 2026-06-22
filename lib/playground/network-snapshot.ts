export type NetworkSnapshot = {
  sizes: number[];
  activations: number[][];
  weights: number[][][];
  weightGrads: number[][][];
  biasGrads: number[][];
  output: number;
};
