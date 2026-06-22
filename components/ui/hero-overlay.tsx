"use client";

import Link from "next/link";
import { PROJECTS, SITE } from "@/lib/content";

const featured = PROJECTS[0];

export function HeroOverlay() {
  return (
    <div className="overlay">
      <div className="flex justify-between items-start w-full animate-fade-up">
        <span className="text-sm font-medium tracking-wide">
          {SITE.name.split(" ").join("\u00a0").toUpperCase()}
        </span>
        <span className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-55">
          {SITE.title}
        </span>
      </div>

      <div>
        <h1
          className="font-serif italic font-light leading-[0.95] tracking-tight max-w-[14ch] animate-fade-up"
          style={{
            fontSize: "clamp(3rem, 9vw, 8rem)",
            animationDelay: "0.2s",
          }}
        >
          building
          <br />
          <em className="hero-accent">intelligent</em>
          <br />
          systems.
        </h1>

        {featured && (
          <Link
            href={`/work/${featured.slug}`}
            className="hero-cta font-mono pointer-events-auto animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            Try the demo →
          </Link>
        )}
      </div>

      <div
        className="flex justify-between items-end w-full animate-fade-up"
        style={{ animationDelay: "0.8s" }}
      >
        <span className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-55">
          {SITE.availability}
        </span>
        <a
          href="/#work"
          className="hero-scroll font-mono pointer-events-auto"
        >
          <span>Scroll</span>
          <div className="hero-scroll__line" aria-hidden />
        </a>
      </div>
    </div>
  );
}
