"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

/** Pause WebGL when the tab is hidden. */
export function SceneLoop() {
  const setFrameloop = useThree((s) => s.setFrameloop);

  useEffect(() => {
    const sync = () => {
      setFrameloop(document.hidden ? "never" : "always");
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [setFrameloop]);

  return null;
}
