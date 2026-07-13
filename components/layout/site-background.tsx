"use client";

import { HeroScene } from "@/components/three/hero-scene";
import { ScrollAtmosphere } from "@/components/scroll-atmosphere";
import { HeroNetworkGraph } from "@/components/ui/hero-network-graph";
import { WaterCaustics } from "@/components/ui/water-caustics";
import { QUALITY, useQualityTier } from "@/lib/quality";
import { usePrefersNativeScroll, usePrefersReducedMotion } from "@/lib/motion-preference";

type Props = {
  scrollAtmosphere?: boolean;
  scene?: "full" | "static";
};

export function SiteBackground({ scrollAtmosphere = false, scene = "full" }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const nativeScroll = usePrefersNativeScroll();
  const tier = useQualityTier();
  const showCanvas = scene === "full" && !reducedMotion && !nativeScroll;
  const showHeroGraph =
    scrollAtmosphere && showCanvas && QUALITY.heroNetworkGraph[tier];
  const waterClass =
    scene === "static" || reducedMotion || nativeScroll
      ? "water-bg water-bg--static"
      : "water-bg";
  const vignetteClass =
    scene === "static" ? "vignette vignette--page" : "vignette";

  return (
    <>
      {scrollAtmosphere && showCanvas && <ScrollAtmosphere />}
      <div className={waterClass} aria-hidden="true" />
      {showCanvas && <WaterCaustics tier={tier} />}
      {showHeroGraph && <HeroNetworkGraph />}
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
