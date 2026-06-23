"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

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

    if (prevPath.current === pathname) return;

    const diving = pathname.startsWith("/work/");
    const surfacing = prevPath.current.startsWith("/work/") && pathname === "/";

    if ((diving || surfacing) && overlay) {
      overlay.classList.remove("route-overlay--dive", "route-overlay--surface");
      void overlay.offsetWidth;
      overlay.classList.add(diving ? "route-overlay--dive" : "route-overlay--surface");
      document.documentElement.classList.toggle("route-lab", diving);

      const timer = window.setTimeout(() => {
        overlay.classList.remove("route-overlay--dive", "route-overlay--surface");
        if (surfacing) document.documentElement.classList.remove("route-lab");
      }, 900);

      prevPath.current = pathname;
      return () => clearTimeout(timer);
    }

    prevPath.current = pathname;
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
