/**
 * Lenis already subtracts scroll-padding/scroll-margin from the target.
 * Keep JS offset at 0 and set clearance in CSS only (see html scroll-padding-top).
 */
export const SECTION_SCROLL_OFFSET = 0;

export function resolveSectionScrollTarget(sectionOrEl: HTMLElement): HTMLElement {
  if (sectionOrEl.id === "hero") return sectionOrEl;
  const header = sectionOrEl.matches("[data-section-anchor], .section-header")
    ? sectionOrEl
    : sectionOrEl.querySelector<HTMLElement>("[data-section-anchor], .section-header");
  return header ?? sectionOrEl;
}

export function sectionScrollOffset(target: HTMLElement): number {
  if (target.id === "hero") return 0;
  return SECTION_SCROLL_OFFSET;
}

export function scrollToSectionElement(
  el: HTMLElement,
  options: {
    lenis?: {
      scrollTo: (
        target: HTMLElement | number | string,
        opts?: { offset?: number; duration?: number; immediate?: boolean },
      ) => void;
    } | null;
    duration?: number;
    immediate?: boolean;
  } = {},
) {
  const { lenis, duration = 1.35, immediate = false } = options;
  const target = resolveSectionScrollTarget(el);
  const offset = sectionScrollOffset(target.id === "hero" ? el : target);

  if (lenis) {
    lenis.scrollTo(target, {
      offset,
      duration: immediate ? 0 : duration,
      immediate,
    });
    return;
  }

  target.scrollIntoView({ behavior: immediate ? "auto" : "smooth", block: "start" });
}
