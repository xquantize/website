// Tiny scalar-valued autograd, micrograd-style.
// One Value = one node in the computation graph.

export class Value {
    data: number;
    grad: number = 0;
    private _backward: () => void = () => {};
    private _prev: Value[];
  
    constructor(data: number, _prev: Value[] = []) {
      this.data = data;
      this._prev = _prev;
    }
  
    add(other: Value | number): Value {
      const o = other instanceof Value ? other : new Value(other);
      const out = new Value(this.data + o.data, [this, o]);
      out._backward = () => {
        this.grad += out.grad;
        o.grad += out.grad;
      };
      return out;
    }
  
    mul(other: Value | number): Value {
      const o = other instanceof Value ? other : new Value(other);
      const out = new Value(this.data * o.data, [this, o]);
      out._backward = () => {
        this.grad += o.data * out.grad;
        o.grad += this.data * out.grad;
      };
      return out;
    }
  
    sub(other: Value | number): Value {
      const o = other instanceof Value ? other : new Value(other);
      return this.add(o.mul(-1));
    }
  
    pow(n: number): Value {
      const out = new Value(this.data ** n, [this]);
      out._backward = () => {
        this.grad += n * this.data ** (n - 1) * out.grad;
      };
      return out;
    }
  
    tanh(): Value {
      const t = Math.tanh(this.data);
      const out = new Value(t, [this]);
      out._backward = () => {
        this.grad += (1 - t * t) * out.grad;
      };
      return out;
    }
  
    relu(): Value {
      const r = this.data > 0 ? this.data : 0;
      const out = new Value(r, [this]);
      out._backward = () => {
        this.grad += (this.data > 0 ? 1 : 0) * out.grad;
      };
      return out;
    }
  
    sigmoid(): Value {
      const s = 1 / (1 + Math.exp(-this.data));
      const out = new Value(s, [this]);
      out._backward = () => {
        this.grad += s * (1 - s) * out.grad;
      };
      return out;
    }
  
    backward() {
      const topo: Value[] = [];
      const visited = new Set<Value>();
      const build = (v: Value) => {
        if (visited.has(v)) return;
        visited.add(v);
        for (const p of v._prev) build(p);
        topo.push(v);
      };
      build(this);
      for (const v of topo) v.grad = 0;
      this.grad = 1;
      for (let i = topo.length - 1; i >= 0; i--) topo[i]._backward();
    }
  }
  
  export type Activation = "tanh" | "relu" | "sigmoid";
  
  export function applyActivation(v: Value, kind: Activation): Value {
    if (kind === "tanh") return v.tanh();
    if (kind === "relu") return v.relu();
    return v.sigmoid();
  }
