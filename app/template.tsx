"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { syncScrollLayout } from "@/lib/scroll-layout-sync";

const ROUTE_TRANSITION_MS = 900;
const PAGE_ENTER_MS = 550;
const HASH_SETTLE_MS = 100;

const PATH_STORE_KEY = "__portfolioPathStore";

type PathStore = {
  current: string | null;
  previous: string | null;
};

/**
 * Survives template remounts and React Strict Mode double-mounting.
 * Only advances when pathname actually changes — so a Strict remount of the
 * same route still sees pathChanged=true against the real previous route.
 */
function getPathStore(): PathStore {
  const g = globalThis as unknown as Record<string, PathStore | undefined>;
  if (!g[PATH_STORE_KEY]) {
    g[PATH_STORE_KEY] = { current: null, previous: null };
  }
  return g[PATH_STORE_KEY]!;
}

function settleScrollLayout(reason: string) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      syncScrollLayout({ reason });
    });
  });
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    const overlay = overlayRef.current;
    if (!content) return;

    content.classList.remove("page-enter");
    void content.offsetWidth;
    content.classList.add("page-enter");

    const store = getPathStore();
    const navigated = store.current !== pathname;
    if (navigated) {
      store.previous = store.current;
      store.current = pathname;
    }

    const previous = store.previous;
    const pathChanged = previous !== null && previous !== pathname;
    const diving = pathname.startsWith("/work/");
    const surfacing = Boolean(previous?.startsWith("/work/")) && pathname === "/";
    const hasRouteOverlay = pathChanged && (diving || surfacing) && Boolean(overlay);
    const hasHash = Boolean(window.location.hash);

    let routeTimer: number | undefined;
    let syncTimer: number | undefined;

    if (hasRouteOverlay && overlay) {
      overlay.classList.remove("route-overlay--dive", "route-overlay--surface");
      void overlay.offsetWidth;
      overlay.classList.add(diving ? "route-overlay--dive" : "route-overlay--surface");
      document.documentElement.classList.toggle("route-lab", diving);

      routeTimer = window.setTimeout(() => {
        overlay.classList.remove("route-overlay--dive", "route-overlay--surface");
        if (surfacing) document.documentElement.classList.remove("route-lab");
      }, ROUTE_TRANSITION_MS);
    }

    // Soft route change: wait for overlay / page-enter to finish.
    // Hash-only or hard load into a hash: settle almost immediately so triggers match scroll.
    if (pathChanged) {
      const delay = hasRouteOverlay ? ROUTE_TRANSITION_MS : PAGE_ENTER_MS;
      syncTimer = window.setTimeout(() => {
        settleScrollLayout(hasRouteOverlay ? "route-transition" : "page-enter");
      }, delay);
    } else if (hasHash) {
      syncTimer = window.setTimeout(() => {
        settleScrollLayout("hash-entry");
      }, HASH_SETTLE_MS);
    }

    return () => {
      if (routeTimer) window.clearTimeout(routeTimer);
      if (syncTimer) window.clearTimeout(syncTimer);
    };
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("route-lab", pathname.startsWith("/work/"));
  }, [pathname]);

  return (
    <>
      <div ref={overlayRef} className="route-overlay" aria-hidden="true" />
      <div ref={contentRef} className="page-enter">
        {children}
      </div>
    </>
  );
}
