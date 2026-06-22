import { Playground } from "@/components/playground/playground";

export const metadata = {
  title: "Playground — Zane Neave",
  description:
    "A small neural network learning live in your browser. Hand-rolled autograd, no framework.",
};

export default function PlaygroundPage() {
  return (
    <>
      <div className="water-bg" aria-hidden="true" />
      <div className="vignette" />
      <div className="grain" />

      <main className="scroll-content min-h-screen px-10 py-32">
        <div className="max-w-5xl mx-auto">
          <div className="section-divider" />
          <p className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-40 mb-6">
            Playground · 01
          </p>
          <h1
            className="font-serif italic font-light tracking-tight leading-[1.05] mb-6"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)" }}
          >
            A tiny network,
            <br />
            learning live.
          </h1>
          <p className="text-sm opacity-55 leading-relaxed max-w-lg mb-16">
            Hand-rolled scalar autograd, an MLP a few neurons wide, trained
            in your browser. No framework, no server. Watch the decision
            boundary form as gradients flow.
          </p>

          <Playground />
        </div>
      </main>
    </>
  );
}
