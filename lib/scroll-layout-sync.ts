import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resolveSectionScrollTarget, sectionScrollOffset } from "@/lib/section-scroll";

gsap.registerPlugin(ScrollTrigger);

export const SCROLL_LAYOUT_SYNC_EVENT = "scroll-layout-sync";

export type ScrollLayoutSyncDetail = {
  reason?: string;
};

type LenisLike = {
  resize: () => void;
  scrollTo: (
    target: number | string | HTMLElement,
    options?: {
      immediate?: boolean;
      offset?: number;
      duration?: number;
      onComplete?: () => void;
    },
  ) => void;
  scroll?: number;
  actualScroll?: number;
  limit?: number;
};

let lenisRef: LenisLike | null = null;

export function registerLenis(lenis: LenisLike | null) {
  lenisRef = lenis;
}

/** 0–1 page scroll — prefers Lenis when active. */
export function getScrollProgress(): number {
  if (typeof window === "undefined") return 0;
  if (lenisRef && typeof lenisRef.limit === "number" && lenisRef.limit > 0) {
    const s = lenisRef.scroll ?? lenisRef.actualScroll ?? 0;
    return Math.max(0, Math.min(1, s / lenisRef.limit));
  }
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return Math.max(0, Math.min(1, window.scrollY / max));
}

function resolveHashTarget(): HTMLElement | null {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return null;
  try {
    return document.getElementById(raw);
  } catch {
    return null;
  }
}

function settleTriggers(detail: ScrollLayoutSyncDetail) {
  ScrollTrigger.refresh();
  ScrollTrigger.update();
  // Force one ticker pass so scrubbed/once triggers apply state without waiting for input.
  gsap.ticker.tick();

  window.dispatchEvent(
    new CustomEvent<ScrollLayoutSyncDetail>(SCROLL_LAYOUT_SYNC_EVENT, { detail }),
  );
}

/**
 * Re-sync Lenis + ScrollTrigger after a route transition settles.
 * If the URL has a hash, scrolls to that target (via Lenis when available) and only then
 * refreshes/updates triggers against the final scroll position.
 */
export function syncScrollLayout(detail: ScrollLayoutSyncDetail = {}) {
  if (typeof window === "undefined") return;

  lenisRef?.resize();

  const hashTarget = resolveHashTarget();
  let settled = false;

  const finish = () => {
    if (settled) return;
    settled = true;
    settleTriggers(detail);
  };

  if (hashTarget) {
    const target = resolveSectionScrollTarget(hashTarget);
    if (lenisRef) {
      lenisRef.scrollTo(target, {
        offset: sectionScrollOffset(hashTarget.id === "hero" ? hashTarget : target),
        duration: 1.25,
        onComplete: finish,
      });
      // Safety if onComplete is skipped (interrupted scroll, etc.)
      window.setTimeout(finish, 1500);
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(finish, 500);
    return;
  }

  if (lenisRef) {
    lenisRef.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo(0, 0);
  }

  finish();
}
