"use client";

import { CustomCursor } from "@/components/ui/custom-cursor";
import { DepthIndicator } from "@/components/ui/depth-indicator";
import { SectionKeyboardNav } from "@/components/ui/section-keyboard-nav";
import { TerminalEasterEgg } from "@/components/ui/terminal-easter-egg";

export function AppChrome() {
  return (
    <>
      <CustomCursor />
      <DepthIndicator />
      <SectionKeyboardNav />
      <TerminalEasterEgg />
    </>
  );
}
