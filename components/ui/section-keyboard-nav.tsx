"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { usePrefersReducedMotion } from "@/lib/motion-preference";

const SECTION_IDS = ["hero", "work", "about", "contact"] as const;

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function SectionKeyboardNav() {
  const pathname = usePathname();
  const lenis = useLenis();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (pathname !== "/" || reducedMotion) return;

    const scrollToId = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (lenis) {
        lenis.scrollTo(el, { offset: 0, duration: 1.4 });
      } else {
        el.scrollIntoView({ behavior: "smooth" });
      }
    };

    const currentIndex = () => {
      const mid = window.innerHeight * 0.42;
      let best = 0;
      let bestDist = Infinity;
      SECTION_IDS.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const dist = Math.abs(el.getBoundingClientRect().top - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      return best;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.body.dataset.terminalOpen === "true") return;

      const nextKeys = ["j", "J", "ArrowDown"];
      const prevKeys = ["k", "K", "ArrowUp"];
      if (!nextKeys.includes(e.key) && !prevKeys.includes(e.key)) return;

      e.preventDefault();
      const idx = currentIndex();
      const delta = nextKeys.includes(e.key) ? 1 : -1;
      const next = Math.max(0, Math.min(SECTION_IDS.length - 1, idx + delta));
      scrollToId(SECTION_IDS[next]);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, lenis, reducedMotion]);

  return null;
}
