"use client";

import { HeroScene } from "@/components/three/hero-scene";
import { ScrollAtmosphere } from "@/components/scroll-atmosphere";
import { usePrefersReducedMotion } from "@/lib/motion-preference";

type Props = {
  scrollAtmosphere?: boolean;
  scene?: "full" | "static";
};

export function SiteBackground({ scrollAtmosphere = false, scene = "full" }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const showCanvas = scene === "full" && !reducedMotion;
  const waterClass =
    scene === "static" || reducedMotion ? "water-bg water-bg--static" : "water-bg";
  const vignetteClass =
    scene === "static" ? "vignette vignette--page" : "vignette";

  return (
    <>
      {scrollAtmosphere && showCanvas && <ScrollAtmosphere />}
      <div className={waterClass} aria-hidden="true" />
      {showCanvas && (
        <div className="canvas-container">
          <HeroScene />
        </div>
      )}
      <div className={vignetteClass} />
      <div className="grain" />
    </>
  );
}
