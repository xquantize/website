"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { DepthIndicator } from "@/components/ui/depth-indicator";
import { MobileContactCta } from "@/components/ui/mobile-contact-cta";
import { SectionKeyboardNav } from "@/components/ui/section-keyboard-nav";
import { TerminalEasterEgg } from "@/components/ui/terminal-easter-egg";

const CommandPalette = dynamic(
  () =>
    import("@/components/ui/command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);

/**
 * Defer cmdk until idle or first ⌘K — keeps initial chrome light.
 */
function DeferredCommandPalette() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;

    let cancelled = false;
    const enable = () => {
      if (!cancelled) setReady(true);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "k" || !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      void import("@/components/ui/command-palette").then((m) => {
        m.requestCommandPaletteOpen();
        enable();
      });
    };

    window.addEventListener("keydown", onKeyDown);

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 4000 });
    } else {
      timeoutId = setTimeout(enable, 3000);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKeyDown);
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [ready]);

  if (!ready) return null;
  return <CommandPalette />;
}

export function AppChrome() {
  return (
    <>
      <CustomCursor />
      <DepthIndicator />
      <MobileContactCta />
      <SectionKeyboardNav />
      <TerminalEasterEgg />
      <DeferredCommandPalette />
    </>
  );
}
