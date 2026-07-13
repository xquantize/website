"use client";

import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { registerLenis, SCROLL_LAYOUT_SYNC_EVENT } from "@/lib/scroll-layout-sync";
import { usePrefersNativeScroll, usePrefersReducedMotion } from "@/lib/motion-preference";

gsap.registerPlugin(ScrollTrigger);

function ScrollSync() {
  const lenis = useLenis();

  useEffect(() => {
    registerLenis(lenis ?? null);
    return () => registerLenis(null);
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onLayoutSync = () => {
      // syncScrollLayout already refreshed/updated; keep Lenis dimensions current.
      lenis.resize();
    };

    window.addEventListener(SCROLL_LAYOUT_SYNC_EVENT, onLayoutSync);

    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", ScrollTrigger.update);
      window.removeEventListener(SCROLL_LAYOUT_SYNC_EVENT, onLayoutSync);
    };
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const nativeScroll = usePrefersNativeScroll();

  if (reducedMotion || nativeScroll) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.14,
        duration: 0.95,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
      }}
    >
      <ScrollSync />
      {children}
    </ReactLenis>
  );
}
