const SNIPPETS = [
  {
    title: "Value.backward()",
    code: `backward() {
  const topo = buildTopo(this);
  for (const v of topo) v.grad = 0;
  this.grad = 1;
  for (let i = topo.length - 1; i >= 0; i--)
    topo[i]._backward();
}`,
  },
  {
    title: "One training step",
    code: `for (const s of dataset) {
  const score = mlp.forward([s.x, s.y]);
  const hinge = score.mul(s.label).mul(-1).add(1).relu();
  totalLoss = totalLoss.add(hinge);
}
total.backward();
for (const p of params)
  p.data -= learningRate * p.grad;`,
  },
] as const;

export function SourcePanel() {
  return (
    <details className="lab-source pointer-events-auto">
      <summary className="lab-source__summary font-mono">View source</summary>
      <div className="lab-source__body">
        <p className="lab-source__note font-mono">
          Scalar autograd — no PyTorch. Abbreviated from{" "}
          <code className="lab-source__file">lib/playground/</code>.
        </p>
        {SNIPPETS.map((s) => (
          <div key={s.title} className="lab-source__block">
            <p className="lab-source__label font-mono">{s.title}</p>
            <pre className="lab-source__code">
              <code>{s.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </details>
  );
}
