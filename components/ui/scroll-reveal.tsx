"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/lib/motion-preference";

gsap.registerPlugin(ScrollTrigger);

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  mode?: "once" | "scrub";
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  mode = "once",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const tween =
      mode === "scrub"
        ? gsap.fromTo(
            el,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 92%",
                end: "top 60%",
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            },
          )
        : gsap.fromTo(
            el,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              delay,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                once: true,
                invalidateOnRefresh: true,
              },
            },
          );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, mode, reducedMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
