import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const SCROLL_LAYOUT_SYNC_EVENT = "scroll-layout-sync";

export type ScrollLayoutSyncDetail = {
  scrollToTop?: boolean;
  reason?: string;
};

type LenisLike = {
  resize: () => void;
  scrollTo: (target: number, options?: { immediate?: boolean }) => void;
};

let lenisRef: LenisLike | null = null;

export function registerLenis(lenis: LenisLike | null) {
  lenisRef = lenis;
}

export function syncScrollLayout(detail: ScrollLayoutSyncDetail = {}) {
  if (typeof window === "undefined") return;

  if (detail.scrollToTop) {
    if (lenisRef) {
      lenisRef.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }

  lenisRef?.resize();
  ScrollTrigger.refresh();
  ScrollTrigger.update();

  window.dispatchEvent(
    new CustomEvent<ScrollLayoutSyncDetail>(SCROLL_LAYOUT_SYNC_EVENT, { detail }),
  );
}
