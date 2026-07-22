"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";

const GRACE_MS = 2500;
const IDLE_MS = 1200;

/**
 * Run WebGL while the tab is visible and the user is interacting.
 * After a short grace period, idle → demand (GPU quiet) until scroll/pointer resumes.
 */
export function SceneLoop() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  const activeRef = useRef(true);

  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let graceTimer: ReturnType<typeof setTimeout> | null = null;

    const apply = (mode: "always" | "demand" | "never") => {
      if (document.hidden) {
        setFrameloop("never");
        return;
      }
      setFrameloop(mode);
    };

    const goIdle = () => {
      activeRef.current = false;
      apply("demand");
    };

    const bump = () => {
      if (document.hidden) return;
      if (!activeRef.current) {
        activeRef.current = true;
        apply("always");
        invalidate();
      }
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(goIdle, IDLE_MS);
    };

    apply("always");
    graceTimer = setTimeout(() => {
      idleTimer = setTimeout(goIdle, IDLE_MS);
    }, GRACE_MS);

    const onVisibility = () => {
      if (document.hidden) {
        setFrameloop("never");
        return;
      }
      bump();
    };

    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener("pointermove", bump, opts);
    window.addEventListener("pointerdown", bump, opts);
    window.addEventListener("wheel", bump, opts);
    window.addEventListener("touchstart", bump, opts);
    window.addEventListener("scroll", bump, opts);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (graceTimer) clearTimeout(graceTimer);
      window.removeEventListener("pointermove", bump);
      window.removeEventListener("pointerdown", bump);
      window.removeEventListener("wheel", bump);
      window.removeEventListener("touchstart", bump);
      window.removeEventListener("scroll", bump);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [setFrameloop, invalidate]);

  return null;
}
