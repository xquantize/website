"use client";

import { SITE } from "@/lib/content";

export function HeroOverlay() {
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
          className="hero-title font-serif italic font-light leading-[0.95] tracking-tight max-w-[14ch] animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          building
          <br />
          <em className="hero-accent">intelligent</em>
          <br />
          systems.
        </h1>
      </div>

      <div
        className="overlay__bar overlay__bar--bottom animate-fade-up"
        style={{ animationDelay: "0.8s" }}
      >
        <span className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-55">
          {SITE.availability}
        </span>
        <a href="/#work" className="hero-scroll font-mono pointer-events-auto">
          <span>Scroll</span>
          <div className="hero-scroll__line" aria-hidden />
        </a>
      </div>
    </div>
  );
}
