"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HeroScene } from "@/components/three/hero-scene";
import { ScrollAtmosphere } from "@/components/scroll-atmosphere";
import { NeuralFallback } from "@/components/ui/neural-fallback";
import { QUALITY, useQualityTier } from "@/lib/quality";
import { usePrefersNativeScroll, usePrefersReducedMotion } from "@/lib/motion-preference";

type Props = {
  scrollAtmosphere?: boolean;
  scene?: "full" | "static";
};

const DESKTOP_NEURAL_MQ = "(min-width: 1024px)";

export function SiteBackground({ scrollAtmosphere = false, scene = "full" }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const nativeScroll = usePrefersNativeScroll();
  const tier = useQualityTier();
  const [desktopColumn, setDesktopColumn] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_NEURAL_MQ);
    const sync = () => setDesktopColumn(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Confined WebGL column is desktop-only; below 1024px use Canvas2D fallback.
  const showWebGL =
    scene === "full" &&
    desktopColumn &&
    !reducedMotion &&
    !nativeScroll &&
    QUALITY.neuralWebGL[tier];

  const showFallback = !showWebGL;
  const runScrollAtmosphere = Boolean(scrollAtmosphere) && scene === "full";
  const vignetteClass = scene === "static" ? "vignette vignette--page" : "vignette";
  const fallbackAmbient = scene === "static" || reducedMotion || !scrollAtmosphere;

  // Portal fixed layers to <body>. `.page-enter` keeps an identity transform after its
  // animation, which makes position:fixed descendants scroll with the document.
  const layers = (
    <>
      <div
        className={
          scene === "static" || reducedMotion
            ? "neural-bg neural-bg--static"
            : "neural-bg"
        }
        aria-hidden
      />
      {showWebGL ? (
        <div className="canvas-container canvas-container--column">
          <HeroScene tier={tier} />
        </div>
      ) : null}
      {showFallback ? <NeuralFallback ambient={fallbackAmbient} /> : null}
      <div className={vignetteClass} />
      <div className="grain" />
    </>
  );

  return (
    <>
      {runScrollAtmosphere && <ScrollAtmosphere />}
      {portalReady ? createPortal(layers, document.body) : null}
    </>
  );
}
