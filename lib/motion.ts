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
  revealDuration: 0.75,
  revealY: 20,
  revealStart: "top 90%",
  /** Hero title line scrub stagger (scroll-linked, not entrance) */
  heroScrubStagger: 0.08,
  /** Hero CSS fade-up is intentionally softer/slower than ScrollReveal */
  heroEntranceY: 8,
  heroEntranceDuration: 0.75,
} as const;
