"use client";

import { CommandPalette } from "@/components/ui/command-palette";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { DepthIndicator } from "@/components/ui/depth-indicator";
import { MobileContactCta } from "@/components/ui/mobile-contact-cta";
import { SectionKeyboardNav } from "@/components/ui/section-keyboard-nav";
import { TerminalEasterEgg } from "@/components/ui/terminal-easter-egg";

export function AppChrome() {
  return (
    <>
      <CustomCursor />
      <DepthIndicator />
      <MobileContactCta />
      <SectionKeyboardNav />
      <TerminalEasterEgg />
      <CommandPalette />
    </>
  );
}
