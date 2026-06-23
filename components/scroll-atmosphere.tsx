"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  applyAtmosphereToDom,
  resetScrollAtmosphere,
  scrollAtmosphere,
} from "@/lib/scroll-atmosphere";

gsap.registerPlugin(ScrollTrigger);

export function ScrollAtmosphere() {
  useEffect(() => {
    resetScrollAtmosphere();
    applyAtmosphereToDom();

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".home-page",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.6,
          onUpdate: (self) => {
            scrollAtmosphere.pageScroll = self.progress;
            applyAtmosphereToDom();
          },
        },
      });

      // Surface → descent: hero fades, mood builds
      tl.to(scrollAtmosphere, {
        cameraZ: 6.8,
        particleOpacity: 0.44,
        particleSpeed: 0.78,
        bloomIntensity: 0.32,
        waterHue: 3,
        waterBright: 0.94,
        vignetteStrength: 0.44,
        scrollDepth: 0.12,
        heroOpacity: 0,
        fishOpacity: 0.82,
        fishSpeed: 0.88,
        ease: "none",
      })
        // Work: brightest band — peak readability
        .to(scrollAtmosphere, {
          cameraZ: 5.8,
          particleOpacity: 0.48,
          particleSpeed: 0.62,
          bloomIntensity: 0.36,
          waterHue: 5,
          waterBright: 1.04,
          vignetteStrength: 0.34,
          scrollDepth: 0.22,
          fishOpacity: 0.92,
          fishSpeed: 0.72,
          ease: "none",
        })
        // About: still sunlit — hue shifts, stays open
        .to(scrollAtmosphere, {
          cameraZ: 6.4,
          particleOpacity: 0.42,
          particleSpeed: 0.52,
          bloomIntensity: 0.33,
          waterHue: 10,
          waterBright: 1.02,
          vignetteStrength: 0.36,
          scrollDepth: 0.32,
          fishOpacity: 0.88,
          fishSpeed: 0.58,
          ease: "none",
        })
        // Contact: twilight, not abyss
        .to(scrollAtmosphere, {
          cameraZ: 8.2,
          particleOpacity: 0.28,
          particleSpeed: 0.38,
          bloomIntensity: 0.24,
          waterHue: 12,
          waterBright: 0.94,
          vignetteStrength: 0.48,
          scrollDepth: 0.44,
          fishOpacity: 0.72,
          fishSpeed: 0.42,
          ease: "none",
        })
        // Footer: dusk — moody but capped
        .to(scrollAtmosphere, {
          cameraZ: 9.4,
          particleOpacity: 0.2,
          particleSpeed: 0.28,
          bloomIntensity: 0.18,
          waterHue: 8,
          waterBright: 0.9,
          vignetteStrength: 0.56,
          scrollDepth: 0.52,
          fishOpacity: 0.58,
          fishSpeed: 0.3,
          ease: "none",
        });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
