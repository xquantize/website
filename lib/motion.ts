/**
 * Shared motion language for GSAP tweens.
 * CSS counterparts live on `:root` as `--ease-*` / `--duration-*`.
 *
 * - enter: content appearing (reveals, page-enter)
 * - exit:  content leaving (route overlays) — CSS-only today; reserved for GSAP exits
 * - micro: snappy hover/press feedback (150–250ms in CSS)
 */
export const EASE = {
  enter: "power2.out",
  exit: "power2.in",
  micro: "power2.inOut",
  /** Scroll-scrubbed / linked motion — linear by design */
  none: "none",
} as const;

export const MOTION = {
  /** ScrollReveal once-mode */
  revealDuration: 1.05,
  revealY: 32,
  revealStart: "top 88%",
  /** Hero title line scrub stagger (scroll-linked, not entrance) */
  heroScrubStagger: 0.08,
  /** Hero CSS fade-up is intentionally softer/slower than ScrollReveal */
  heroEntranceY: 10,
  heroEntranceDuration: 0.9,
} as const;
