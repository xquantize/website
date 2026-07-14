"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE } from "@/lib/motion";
import {
  applyAtmosphereToDom,
  resetScrollAtmosphere,
  scrollAtmosphere,
} from "@/lib/scroll-atmosphere";
import { SCROLL_LAYOUT_SYNC_EVENT } from "@/lib/scroll-layout-sync";

gsap.registerPlugin(ScrollTrigger);

/**
 * Mood / density / hero fade only.
 * Network travel is driven inside NeuralField from Lenis scroll each frame.
 */
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
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: () => {
            applyAtmosphereToDom();
          },
        },
      });

      tl.to(scrollAtmosphere, {
        cameraZ: 10.3,
        networkDensity: 0.38,
        pulseEnergy: 0.28,
        nodeOpacity: 0.62,
        edgeOpacity: 0.24,
        bloomIntensity: 0.18,
        bgBright: 0.97,
        vignetteStrength: 0.38,
        scrollDepth: 0.18,
        heroOpacity: 0,
        fogDensity: 0.022,
        driftAmount: 0.35,
        ease: EASE.none,
      })
        .to(scrollAtmosphere, {
          cameraZ: 10.1,
          networkDensity: 0.45,
          pulseEnergy: 0.34,
          nodeOpacity: 0.68,
          edgeOpacity: 0.26,
          bloomIntensity: 0.2,
          bgBright: 1.0,
          vignetteStrength: 0.34,
          scrollDepth: 0.34,
          fogDensity: 0.02,
          driftAmount: 0.4,
          ease: EASE.none,
        })
        .to(scrollAtmosphere, {
          cameraZ: 9.9,
          networkDensity: 0.52,
          pulseEnergy: 0.4,
          nodeOpacity: 0.72,
          edgeOpacity: 0.28,
          bloomIntensity: 0.22,
          bgBright: 0.98,
          vignetteStrength: 0.38,
          scrollDepth: 0.52,
          fogDensity: 0.022,
          driftAmount: 0.45,
          ease: EASE.none,
        })
        .to(scrollAtmosphere, {
          cameraZ: 9.7,
          networkDensity: 0.58,
          pulseEnergy: 0.45,
          nodeOpacity: 0.76,
          edgeOpacity: 0.3,
          bloomIntensity: 0.22,
          bgBright: 0.94,
          vignetteStrength: 0.44,
          scrollDepth: 0.74,
          fogDensity: 0.026,
          driftAmount: 0.48,
          ease: EASE.none,
        })
        .to(scrollAtmosphere, {
          cameraZ: 9.5,
          networkDensity: 0.62,
          pulseEnergy: 0.48,
          nodeOpacity: 0.78,
          edgeOpacity: 0.32,
          bloomIntensity: 0.2,
          bgBright: 0.9,
          vignetteStrength: 0.5,
          scrollDepth: 0.92,
          fogDensity: 0.03,
          driftAmount: 0.5,
          ease: EASE.none,
        });
    });

    const onLayoutSync = () => applyAtmosphereToDom();
    window.addEventListener(SCROLL_LAYOUT_SYNC_EVENT, onLayoutSync);

    return () => {
      window.removeEventListener(SCROLL_LAYOUT_SYNC_EVENT, onLayoutSync);
      ctx.revert();
    };
  }, []);

  return null;
}
