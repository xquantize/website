"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { syncScrollLayout } from "@/lib/scroll-layout-sync";

const ROUTE_TRANSITION_MS = 900;
const PAGE_ENTER_MS = 550;

function settleScrollLayout(scrollToTop: boolean, reason: string) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      syncScrollLayout({ scrollToTop, reason });
    });
  });
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const prevPath = useRef(pathname);

  useEffect(() => {
    const content = contentRef.current;
    const overlay = overlayRef.current;
    if (!content) return;

    content.classList.remove("page-enter");
    void content.offsetWidth;
    content.classList.add("page-enter");

    const pathChanged = prevPath.current !== pathname;
    const diving = pathname.startsWith("/work/");
    const surfacing = prevPath.current.startsWith("/work/") && pathname === "/";
    const hasRouteOverlay = pathChanged && (diving || surfacing) && overlay;

    let routeTimer: number | undefined;
    let syncTimer: number | undefined;

    if (hasRouteOverlay) {
      overlay.classList.remove("route-overlay--dive", "route-overlay--surface");
      void overlay.offsetWidth;
      overlay.classList.add(diving ? "route-overlay--dive" : "route-overlay--surface");
      document.documentElement.classList.toggle("route-lab", diving);

      routeTimer = window.setTimeout(() => {
        overlay.classList.remove("route-overlay--dive", "route-overlay--surface");
        if (surfacing) document.documentElement.classList.remove("route-lab");
      }, ROUTE_TRANSITION_MS);
    }

    if (pathChanged) {
      const delay = hasRouteOverlay ? ROUTE_TRANSITION_MS : PAGE_ENTER_MS;
      syncTimer = window.setTimeout(() => {
        settleScrollLayout(true, hasRouteOverlay ? "route-transition" : "page-enter");
      }, delay);
    }

    prevPath.current = pathname;

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
