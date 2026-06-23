"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { scrollAtmosphere } from "@/lib/scroll-atmosphere";
import { usePrefersReducedMotion } from "@/lib/motion-preference";

const MARKS = [
  { id: "hero", label: "Surface" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

export function DepthIndicator() {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const [depth, setDepth] = useState(0);
  const [active, setActive] = useState("hero");

  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome || reducedMotion) return;

    let frame = 0;
    const tick = () => {
      setDepth(scrollAtmosphere.scrollDepth);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isHome, reducedMotion]);

  useEffect(() => {
    if (!isHome) return;

    const sections = MARKS.map((m) => document.getElementById(m.id)).filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: [0, 0.2, 0.5] },
    );

    sections.forEach((section) => observer.observe(section!));
    return () => observer.disconnect();
  }, [isHome]);

  if (!isHome || reducedMotion) return null;

  return (
    <nav className="depth-indicator" aria-label="Scroll depth">
      <div className="depth-indicator__track">
        <div
          className="depth-indicator__fill"
          style={{ transform: `scaleY(${depth})` }}
          aria-hidden
        />
        {MARKS.map((mark) => (
          <a
            key={mark.id}
            href={`/#${mark.id}`}
            className={`depth-indicator__mark${active === mark.id ? " is-active" : ""}`}
            aria-current={active === mark.id ? "true" : undefined}
          >
            <span className="depth-indicator__dot" aria-hidden />
            <span className="depth-indicator__label font-mono">{mark.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
