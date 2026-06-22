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
      gsap.to(scrollAtmosphere, {
        cameraZ: 7.2,
        particleOpacity: 0.42,
        particleSpeed: 0.8,
        bloomIntensity: 0.32,
        waterHue: 3,
        waterBright: 0.97,
        vignetteStrength: 0.58,
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.9,
          onUpdate: applyAtmosphereToDom,
        },
      });

      gsap.to(scrollAtmosphere, {
        cameraZ: 5.6,
        particleOpacity: 0.26,
        particleSpeed: 0.5,
        bloomIntensity: 0.2,
        waterHue: 7,
        waterBright: 0.9,
        vignetteStrength: 0.74,
        scrollTrigger: {
          trigger: "#work",
          start: "top 85%",
          end: "center 40%",
          scrub: 0.9,
          onUpdate: applyAtmosphereToDom,
        },
      });

      gsap.to(scrollAtmosphere, {
        cameraZ: 8.2,
        particleOpacity: 0.34,
        particleSpeed: 0.35,
        bloomIntensity: 0.3,
        waterHue: 16,
        waterBright: 0.94,
        vignetteStrength: 0.62,
        scrollTrigger: {
          trigger: "#about",
          start: "top 85%",
          end: "center 45%",
          scrub: 0.9,
          onUpdate: applyAtmosphereToDom,
        },
      });

      gsap.to(scrollAtmosphere, {
        cameraZ: 10,
        particleOpacity: 0.16,
        particleSpeed: 0.18,
        bloomIntensity: 0.16,
        waterHue: 8,
        waterBright: 0.82,
        vignetteStrength: 0.88,
        scrollTrigger: {
          trigger: "#contact",
          start: "top 90%",
          end: "bottom bottom",
          scrub: 0.9,
          onUpdate: applyAtmosphereToDom,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
