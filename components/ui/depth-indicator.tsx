"use client";

import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "@/lib/motion-preference";
import { scrollToSectionElement } from "@/lib/section-scroll";

const MARKS = [
  { id: "hero", label: "Surface" },
  { id: "bio", label: "Bio" },
  { id: "experience", label: "Experience" },
  { id: "demos", label: "Demos" },
  { id: "contact", label: "Contact" },
] as const;

export function DepthIndicator() {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const lenis = useLenis();
  const [active, setActive] = useState("hero");

  const isHome = pathname === "/";

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
        <div className="depth-indicator__fill" aria-hidden />
        {MARKS.map((mark) => (
          <a
            key={mark.id}
            href={`/#${mark.id}`}
            className={`depth-indicator__mark${active === mark.id ? " is-active" : ""}`}
            aria-current={active === mark.id ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(mark.id);
              if (!el) return;
              scrollToSectionElement(el, { lenis, duration: 1.4 });
              window.history.pushState(null, "", `/#${mark.id}`);
              setActive(mark.id);
            }}
          >
            <span className="depth-indicator__dot" aria-hidden />
            <span className="depth-indicator__label font-mono">{mark.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
