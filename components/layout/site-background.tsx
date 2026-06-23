"use client";

import { HeroScene } from "@/components/three/hero-scene";
import { ScrollAtmosphere } from "@/components/scroll-atmosphere";
import { WaterCaustics } from "@/components/ui/water-caustics";
import { useQualityTier } from "@/lib/quality";
import { usePrefersReducedMotion } from "@/lib/motion-preference";

type Props = {
  scrollAtmosphere?: boolean;
  scene?: "full" | "static";
};

export function SiteBackground({ scrollAtmosphere = false, scene = "full" }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const tier = useQualityTier();
  const showCanvas = scene === "full" && !reducedMotion;
  const waterClass =
    scene === "static" || reducedMotion ? "water-bg water-bg--static" : "water-bg";
  const vignetteClass =
    scene === "static" ? "vignette vignette--page" : "vignette";

  return (
    <>
      {scrollAtmosphere && showCanvas && <ScrollAtmosphere />}
      <div className={waterClass} aria-hidden="true" />
      {showCanvas && <WaterCaustics tier={tier} />}
      {showCanvas && (
        <div className="canvas-container">
          <HeroScene tier={tier} />
        </div>
      )}
      <div className={vignetteClass} />
      <div className="grain" />
    </>
  );
}
