import { Value, type Activation, applyActivation } from "./autograd";

export class Neuron {
  w: Value[];
  b: Value;
  activation: Activation;

  constructor(nin: number, activation: Activation) {
    // Kaiming-ish init scaled by fan-in
    const scale = Math.sqrt(2 / nin);
    this.w = Array.from(
      { length: nin },
      () => new Value((Math.random() * 2 - 1) * scale)
    );
    this.b = new Value(0);
    this.activation = activation;
  }

  forward(x: Value[]): Value {
    let act: Value = this.b;
    for (let i = 0; i < x.length; i++) act = act.add(this.w[i].mul(x[i]));
    return applyActivation(act, this.activation);
  }

  parameters(): Value[] {
    return [...this.w, this.b];
  }
}

export class Layer {
  neurons: Neuron[];
  constructor(nin: number, nout: number, activation: Activation) {
    this.neurons = Array.from(
      { length: nout },
      () => new Neuron(nin, activation)
    );
  }
  forward(x: Value[]): Value[] {
    return this.neurons.map((n) => n.forward(x));
  }
  parameters(): Value[] {
    return this.neurons.flatMap((n) => n.parameters());
  }
}

export class MLP {
  layers: Layer[];
  constructor(nin: number, hiddenSizes: number[], activation: Activation) {
    const sizes = [nin, ...hiddenSizes, 1];
    this.layers = [];
    for (let i = 0; i < sizes.length - 1; i++) {
      // Output layer is tanh so we can use {-1, +1} labels + hinge loss
      const act = i === sizes.length - 2 ? "tanh" : activation;
      this.layers.push(new Layer(sizes[i], sizes[i + 1], act));
    }
  }
  forward(x: number[]): Value {
    let v: Value[] = x.map((xi) => new Value(xi));
    for (const layer of this.layers) v = layer.forward(v);
    return v[0];
  }
  parameters(): Value[] {
    return this.layers.flatMap((l) => l.parameters());
  }
}
