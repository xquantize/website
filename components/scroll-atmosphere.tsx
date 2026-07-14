"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SCENE } from "@/lib/constants";
import { EASE } from "@/lib/motion";
import {
  applyAtmosphereToDom,
  resetScrollAtmosphere,
  scrollAtmosphere,
} from "@/lib/scroll-atmosphere";
import { SCROLL_LAYOUT_SYNC_EVENT } from "@/lib/scroll-layout-sync";

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
          scrub: 1.2,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            scrollAtmosphere.pageScroll = self.progress;
            applyAtmosphereToDom();
          },
        },
      });

      // Surface → enter the top of the stack
      tl.to(scrollAtmosphere, {
        cameraZ: 17.2,
        travelY: SCENE.travelYStart - 1.1,
        networkDensity: 0.48,
        pulseEnergy: 0.45,
        nodeOpacity: 0.78,
        edgeOpacity: 0.22,
        bloomIntensity: 0.3,
        bgBright: 0.96,
        vignetteStrength: 0.42,
        scrollDepth: 0.18,
        heroOpacity: 0,
        fogDensity: 0.02,
        driftAmount: 0.62,
        ease: EASE.none,
      })
        // Work: mid-upper layers
        .to(scrollAtmosphere, {
          cameraZ: 16.4,
          travelY: 1.4,
          networkDensity: 0.68,
          pulseEnergy: 0.62,
          nodeOpacity: 0.88,
          edgeOpacity: 0.28,
          bloomIntensity: 0.32,
          bgBright: 1.02,
          vignetteStrength: 0.36,
          scrollDepth: 0.32,
          fogDensity: 0.016,
          driftAmount: 0.7,
          ease: EASE.none,
        })
        // About: mid stack — training denser
        .to(scrollAtmosphere, {
          cameraZ: 15.8,
          travelY: -0.2,
          networkDensity: 0.78,
          pulseEnergy: 0.78,
          nodeOpacity: 0.9,
          edgeOpacity: 0.32,
          bloomIntensity: 0.34,
          bgBright: 0.98,
          vignetteStrength: 0.4,
          scrollDepth: 0.48,
          fogDensity: 0.018,
          driftAmount: 0.78,
          ease: EASE.none,
        })
        // Contact: lower layers
        .to(scrollAtmosphere, {
          cameraZ: 15.2,
          travelY: -2.2,
          networkDensity: 0.92,
          pulseEnergy: 0.92,
          nodeOpacity: 0.95,
          edgeOpacity: 0.38,
          bloomIntensity: 0.36,
          bgBright: 0.9,
          vignetteStrength: 0.5,
          scrollDepth: 0.72,
          fogDensity: 0.022,
          driftAmount: 0.85,
          ease: EASE.none,
        })
        // Footer: deepest
        .to(scrollAtmosphere, {
          cameraZ: 14.6,
          travelY: SCENE.travelYEnd,
          networkDensity: 1,
          pulseEnergy: 1,
          nodeOpacity: 1,
          edgeOpacity: 0.42,
          bloomIntensity: 0.3,
          bgBright: 0.86,
          vignetteStrength: 0.58,
          scrollDepth: 0.9,
          fogDensity: 0.026,
          driftAmount: 0.9,
          ease: EASE.none,
        });
    });

    const onLayoutSync = () => {
      applyAtmosphereToDom();
    };

    window.addEventListener(SCROLL_LAYOUT_SYNC_EVENT, onLayoutSync);

    return () => {
      window.removeEventListener(SCROLL_LAYOUT_SYNC_EVENT, onLayoutSync);
      ctx.revert();
    };
  }, []);

  return null;
}
