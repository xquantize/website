"use client";

import { useEffect, useRef } from "react";
import { ensurePointerListener } from "@/lib/pointer";
import { usePrefersReducedMotion } from "@/lib/motion-preference";

type CursorMode = "default" | "link" | "text";

function setPosition(el: HTMLElement, x: number, y: number) {
  el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
}

function modeFromTarget(target: EventTarget | null): CursorMode {
  if (!(target instanceof Element)) return "default";
  const hit = target.closest("a, button, [data-cursor], input, textarea, select, label");
  if (!hit) return "default";
  if (hit instanceof HTMLAnchorElement || hit instanceof HTMLButtonElement) return "link";
  if (hit.matches('[data-cursor="link"]')) return "link";
  if (hit.matches('[data-cursor="text"]')) return "text";
  if (hit.matches("input, textarea, select, label")) return "text";
  return "default";
}

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const mode = useRef<CursorMode>("default");
  const active = useRef(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    ensurePointerListener();

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    const apply = () => {
      setPosition(ring, pos.current.x, pos.current.y);
      setPosition(dot, pos.current.x, pos.current.y);
      ring.dataset.mode = mode.current;
    };

    const show = (x: number, y: number) => {
      pos.current = { x, y };
      apply();
      if (!active.current) {
        active.current = true;
        ring.classList.add("is-visible");
        dot.classList.add("is-visible");
      }
    };

    const hide = () => {
      active.current = false;
      ring.classList.remove("is-visible");
      dot.classList.remove("is-visible");
    };

    const onMove = (e: MouseEvent) => {
      show(e.clientX, e.clientY);
      const next = modeFromTarget(e.target);
      if (next !== mode.current) {
        mode.current = next;
        apply();
      }
    };

    const onOver = (e: MouseEvent) => {
      mode.current = modeFromTarget(e.target);
      apply();
    };

    const onLeave = () => hide();

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
