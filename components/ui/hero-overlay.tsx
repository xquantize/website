"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SITE } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/motion-preference";

gsap.registerPlugin(ScrollTrigger);

export function HeroOverlay() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const title = titleRef.current;
    if (!title || reducedMotion) return;

    const lines = title.querySelectorAll(".hero-title__line");
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
            trigger: "#hero",
            start: "top top",
            end: "75% top",
            scrub: 1.4,
          },
        },
      );

      gsap.fromTo(
        title,
        { scale: 1, y: 0 },
        {
          scale: 0.94,
          y: 24,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: 1.4,
          },
        },
      );
    }, title);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div className="overlay overlay--home">
      <div className="overlay__bar overlay__bar--top animate-fade-up">
        <span className="text-sm font-medium tracking-wide">
          {SITE.name.split(" ").join("\u00a0").toUpperCase()}
        </span>
        <span className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-55">
          {SITE.title}
        </span>
      </div>

      <div className="overlay__main">
        <h1
          ref={titleRef}
          className="hero-title font-serif italic font-light leading-[0.95] tracking-tight max-w-[14ch] animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="hero-title__line">
            <span className="hero-title__inner">building</span>
          </span>
          <span className="hero-title__line">
            <span className="hero-title__inner">
              <em className="hero-accent">intelligent</em>
            </span>
          </span>
          <span className="hero-title__line">
            <span className="hero-title__inner">systems.</span>
          </span>
        </h1>
      </div>

      <div
        className="overlay__bar overlay__bar--bottom animate-fade-up"
        style={{ animationDelay: "0.8s" }}
      >
        <span className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-55">
          {SITE.availability}
        </span>
        <a href="/#work" className="hero-scroll font-mono pointer-events-auto" data-cursor="link">
          <span>Scroll</span>
          <div className="hero-scroll__line" aria-hidden />
        </a>
      </div>
    </div>
  );
}
