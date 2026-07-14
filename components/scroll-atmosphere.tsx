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
        networkDensity: 0.55,
        pulseEnergy: 0.55,
        nodeOpacity: 0.88,
        edgeOpacity: 0.36,
        bloomIntensity: 0.34,
        bgBright: 0.97,
        vignetteStrength: 0.38,
        scrollDepth: 0.18,
        heroOpacity: 0,
        fogDensity: 0.022,
        driftAmount: 0.4,
        ease: EASE.none,
      })
        .to(scrollAtmosphere, {
          cameraZ: 10.1,
          networkDensity: 0.7,
          pulseEnergy: 0.7,
          nodeOpacity: 0.92,
          edgeOpacity: 0.42,
          bloomIntensity: 0.36,
          bgBright: 1.0,
          vignetteStrength: 0.34,
          scrollDepth: 0.34,
          fogDensity: 0.02,
          driftAmount: 0.48,
          ease: EASE.none,
        })
        .to(scrollAtmosphere, {
          cameraZ: 9.9,
          networkDensity: 0.82,
          pulseEnergy: 0.82,
          nodeOpacity: 0.94,
          edgeOpacity: 0.48,
          bloomIntensity: 0.38,
          bgBright: 0.98,
          vignetteStrength: 0.38,
          scrollDepth: 0.52,
          fogDensity: 0.022,
          driftAmount: 0.55,
          ease: EASE.none,
        })
        .to(scrollAtmosphere, {
          cameraZ: 9.7,
          networkDensity: 0.92,
          pulseEnergy: 0.92,
          nodeOpacity: 0.96,
          edgeOpacity: 0.52,
          bloomIntensity: 0.38,
          bgBright: 0.94,
          vignetteStrength: 0.44,
          scrollDepth: 0.74,
          fogDensity: 0.026,
          driftAmount: 0.6,
          ease: EASE.none,
        })
        .to(scrollAtmosphere, {
          cameraZ: 9.5,
          networkDensity: 1,
          pulseEnergy: 1,
          nodeOpacity: 1,
          edgeOpacity: 0.55,
          bloomIntensity: 0.32,
          bgBright: 0.9,
          vignetteStrength: 0.5,
          scrollDepth: 0.92,
          fogDensity: 0.03,
          driftAmount: 0.65,
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
