"use client";

export function HeroOverlay() {
  return (
    <div className="overlay">
      {/* Top bar */}
      <div className="flex justify-between items-start w-full animate-fade-up">
        <span className="text-sm font-medium tracking-wide">
          ZANE&nbsp;NEAVE
        </span>
        <span className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-55">
          ML Engineer &amp; Developer
        </span>
      </div>

      {/* Hero text */}
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
          <em className="text-[#7dd3c0]">intelligent</em>
          <br />
          systems.
        </h1>
      </div>

      {/* Bottom bar */}
      <div
        className="flex justify-between items-end w-full animate-fade-up"
        style={{ animationDelay: "0.8s" }}
      >
        <span className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-55">
          Available for select work
        </span>
        <div className="flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-55">
          <span>Scroll</span>
          <div className="w-12 h-px bg-current animate-pulse-line" />
        </div>
      </div>
    </div>
  );
}
