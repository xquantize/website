"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO_LINES, SITE } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/motion-preference";

gsap.registerPlugin(ScrollTrigger);

export function HeroOverlay() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const title = titleRef.current;
    const hero = document.getElementById("hero");
    if (!title || !hero || reducedMotion) return;

    const lines = title.querySelectorAll(".hero-title__line");
    // Scope to #hero (section), not the title — otherwise "#hero" resolves inside <h1>.
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lines,
        { yPercent: 0, opacity: 1 },
        {
          yPercent: 120,
          opacity: 0,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "75% top",
            scrub: 1.4,
            invalidateOnRefresh: true,
          },
        },
      );

      gsap.fromTo(
        title,
        { scale: 1, y: 0 },
        {
          scale: 0.98,
          y: 16,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1.4,
            invalidateOnRefresh: true,
          },
        },
      );
    }, hero);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div className="overlay overlay--home">
      <div className="overlay__bar overlay__bar--top animate-fade-up">
        <span className="hero-brand">{SITE.name.split(" ").join("\u00a0").toUpperCase()}</span>
        <span className="hero-meta font-mono">{SITE.title}</span>
      </div>

      <div className="overlay__main">
        <div className="hero-stack animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <h1
            ref={titleRef}
            className="hero-title font-serif italic font-light leading-[0.95] tracking-tight"
          >
            {HERO_LINES.map((line) => (
              <span key={line.map((part) => part.text).join("")} className="hero-title__line">
                <span className="hero-title__inner">
                  {line.map((part) =>
                    part.accent ? (
                      <em key={part.text} className="hero-accent">
                        {part.text}
                      </em>
                    ) : (
                      <span key={part.text}>{part.text}</span>
                    ),
                  )}
                </span>
              </span>
            ))}
          </h1>

          <p className="hero-tagline font-mono">{SITE.tagline}</p>

          <ul className="pill-row" aria-label="Focus areas">
            {SITE.capabilities.slice(0, 4).map((item) => (
              <li key={item} className="pill font-mono">
                {item}
              </li>
            ))}
          </ul>

          <div className="hero-actions pointer-events-auto">
            <a href="/#work" className="hero-cta" data-cursor="link">
              View work
            </a>
            <a href="/#contact" className="hero-link" data-cursor="link">
              Get in touch
            </a>
          </div>
        </div>
      </div>

      <div className="overlay__bar overlay__bar--bottom animate-fade-up" style={{ animationDelay: "0.6s" }}>
        <span className="hero-meta font-mono">{SITE.availability}</span>
        <a href="/#work" className="hero-scroll font-mono pointer-events-auto" data-cursor="link">
          <span>Scroll</span>
          <div className="hero-scroll__line" aria-hidden />
        </a>
      </div>
    </div>
  );
}
