import { HeroScene } from "@/components/three/hero-scene";
import { HeroOverlay } from "@/components/ui/hero-overlay";
import { CustomCursor } from "@/components/ui/custom-cursor";

export default function Home() {
  return (
    <>
      {/* Fixed background layers */}
      <div className="water-bg" aria-hidden="true" />
      <div className="canvas-container">
        <HeroScene />
      </div>
      <div className="vignette" />
      <div className="grain" />

      {/* Scrollable content */}
      <div className="scroll-content">
        <section className="hero-section">
          <HeroOverlay />
        </section>

        <section className="content-section">
          <div className="max-w-2xl">
            <div className="section-divider" />
            <p className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-40 mb-6">
              Selected Work
            </p>
            <h2
              className="font-serif italic font-light tracking-tight leading-[1.1] mb-8"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Projects coming soon.
            </h2>
            <p className="text-sm opacity-50 leading-relaxed max-w-md">
              Case studies and technical deep-dives currently in progress.
            </p>
          </div>
        </section>

        <section className="content-section">
          <div className="max-w-2xl">
            <div className="section-divider" />
            <p className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-40 mb-6">
              Contact
            </p>
            <h2
              className="font-serif italic font-light tracking-tight leading-[1.1] mb-8"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Let&apos;s talk.
            </h2>
            <a
              href="mailto:zane.n.neave@gmail.com"
              className="text-sm opacity-50 hover:opacity-100 transition-opacity duration-500 pointer-events-auto"
            >
              zane.n.neave@gmail.com
            </a>
          </div>
        </section>
      </div>

      <CustomCursor />
    </>
  );
}
