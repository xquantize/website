"use client";

import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const COARSE_POINTER_QUERY = "(pointer: coarse)";
const NATIVE_SCROLL_MAX_WIDTH = 640;
const MOTION_OVERRIDE_KEY = "site-motion-reduced";
const MOTION_OVERRIDE_EVENT = "motion-override-change";

function prefersNativeScroll() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia(COARSE_POINTER_QUERY).matches ||
    window.innerWidth < NATIVE_SCROLL_MAX_WIDTH
  );
}

function syncScrollMode(reducedMotion: boolean) {
  document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  document.documentElement.classList.toggle(
    "native-scroll",
    !reducedMotion && prefersNativeScroll(),
  );
}

export function getMotionOverride(): boolean | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(MOTION_OVERRIDE_KEY);
  if (value === null) return null;
  return value === "true";
}

export function setMotionOverride(reduced: boolean | null) {
  if (typeof window === "undefined") return;
  if (reduced === null) {
    localStorage.removeItem(MOTION_OVERRIDE_KEY);
  } else {
    localStorage.setItem(MOTION_OVERRIDE_KEY, String(reduced));
  }
  window.dispatchEvent(new Event(MOTION_OVERRIDE_EVENT));
}

export function toggleMotionOverride() {
  if (typeof window === "undefined") return false;
  const systemReduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
  const override = getMotionOverride();
  const effective = override ?? systemReduced;
  setMotionOverride(!effective);
  return !effective;
}

function effectiveReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  const override = getMotionOverride();
  if (override !== null) return override;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);

    const sync = () => {
      const effective = effectiveReducedMotion();
      setReduced(effective);
      syncScrollMode(effective);
    };

    sync();
    mq.addEventListener("change", sync);
    window.addEventListener(MOTION_OVERRIDE_EVENT, sync);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener(MOTION_OVERRIDE_EVENT, sync);
    };
  }, []);

  return reduced;
}

export function usePrefersNativeScroll() {
  const [nativeScroll, setNativeScroll] = useState(false);

  useEffect(() => {
    const coarseMq = window.matchMedia(COARSE_POINTER_QUERY);
    const reducedMq = window.matchMedia(REDUCED_MOTION_QUERY);

    const sync = () => {
      const reduced = effectiveReducedMotion();
      const native = !reduced && prefersNativeScroll();
      setNativeScroll(native);
      syncScrollMode(reduced);
    };

    sync();
    coarseMq.addEventListener("change", sync);
    reducedMq.addEventListener("change", sync);
    window.addEventListener(MOTION_OVERRIDE_EVENT, sync);
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      coarseMq.removeEventListener("change", sync);
      reducedMq.removeEventListener("change", sync);
      window.removeEventListener(MOTION_OVERRIDE_EVENT, sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return nativeScroll;
}

export function useMotionOverrideLabel() {
  const reduced = usePrefersReducedMotion();
  const [override, setOverride] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setOverride(getMotionOverride());
    sync();
    window.addEventListener(MOTION_OVERRIDE_EVENT, sync);
    return () => window.removeEventListener(MOTION_OVERRIDE_EVENT, sync);
  }, []);

  if (override === null) {
    return reduced ? "Reduce motion (system: on)" : "Reduce motion (system: off)";
  }
  return reduced ? "Reduce motion: on" : "Reduce motion: off";
}
