"use client";

import { Command } from "cmdk";
import { useLenis } from "lenis/react";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SITE } from "@/lib/content";
import {
  toggleMotionOverride,
  useMotionOverrideLabel,
  usePrefersReducedMotion,
} from "@/lib/motion-preference";

const SECTIONS = [
  { id: "hero", label: "Surface", hint: "Home hero" },
  { id: "work", label: "Work", hint: "Featured projects" },
  { id: "about", label: "About", hint: "Bio & capabilities" },
  { id: "contact", label: "Contact", hint: "Get in touch" },
] as const;

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const reducedMotion = usePrefersReducedMotion();
  const motionLabel = useMotionOverrideLabel();

  const close = useCallback(() => {
    setOpen(false);
    document.body.dataset.commandOpen = "false";
  }, []);

  const run = useCallback(
    (action: () => void) => {
      action();
      close();
    },
    [close],
  );

  const scrollToSection = useCallback(
    (id: string) => {
      const go = () => {
        const el = document.getElementById(id);
        if (!el) return;
        if (lenis) {
          lenis.scrollTo(el, { offset: 0, duration: reducedMotion ? 0 : 1.2 });
        } else {
          el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
        }
      };

      if (pathname !== "/") {
        router.push(`/#${id}`);
        window.setTimeout(go, 120);
        return;
      }
      go();
    },
    [lenis, pathname, reducedMotion, router],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.body.dataset.terminalOpen === "true") return;
      if (isTypingTarget(e.target) && !open) return;

      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => {
          const next = !prev;
          document.body.dataset.commandOpen = next ? "true" : "false";
          return next;
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, open]);

  useEffect(() => () => close(), [close]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        document.body.dataset.commandOpen = next ? "true" : "false";
      }}
      label="Command palette"
      overlayClassName="cmd-palette__overlay"
      contentClassName="cmd-palette__content"
      className="cmd-palette"
    >
      <div className="cmd-palette__panel pointer-events-auto">
        <div className="cmd-palette__chrome font-mono">
          <span>~/portfolio</span>
          <button type="button" className="cmd-palette__close font-mono" onClick={close}>
            esc
          </button>
        </div>
        <Command.Input
          className="cmd-palette__input font-mono"
          placeholder="Jump to section, open link…"
        />
        <Command.List className="cmd-palette__list font-mono">
          <Command.Empty className="cmd-palette__empty">No matches.</Command.Empty>

          <Command.Group heading="Navigate" className="cmd-palette__group">
            {SECTIONS.map((section) => (
              <Command.Item
                key={section.id}
                value={`${section.label} ${section.hint}`}
                className="cmd-palette__item"
                onSelect={() => run(() => scrollToSection(section.id))}
              >
                <span>{section.label}</span>
                <span className="cmd-palette__hint">{section.hint}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Open" className="cmd-palette__group">
            <Command.Item
              value="autograd playground scalar autograd demo"
              className="cmd-palette__item"
              onSelect={() => run(() => router.push("/work/autograd-playground"))}
            >
              <span>Autograd playground</span>
              <span className="cmd-palette__hint">Live demo</span>
            </Command.Item>
            <Command.Item
              value="github profile repository xquantize"
              className="cmd-palette__item"
              onSelect={() => run(() => window.open(SITE.github, "_blank", "noopener,noreferrer"))}
            >
              <span>GitHub</span>
              <span className="cmd-palette__hint">External</span>
            </Command.Item>
            <Command.Item
              value="tensortonic profile xquantize"
              className="cmd-palette__item"
              onSelect={() =>
                run(() => window.open(SITE.tensortonic, "_blank", "noopener,noreferrer"))
              }
            >
              <span>TensorTonic</span>
              <span className="cmd-palette__hint">External</span>
            </Command.Item>
            <Command.Item
              value="linkedin profile"
              className="cmd-palette__item"
              onSelect={() =>
                run(() => window.open(SITE.linkedin, "_blank", "noopener,noreferrer"))
              }
            >
              <span>LinkedIn</span>
              <span className="cmd-palette__hint">External</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Preferences" className="cmd-palette__group">
            <Command.Item
              value="reduce motion animation toggle"
              className="cmd-palette__item"
              onSelect={() => run(() => toggleMotionOverride())}
            >
              <span>{motionLabel}</span>
              <span className="cmd-palette__hint">Toggle</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
        <p className="cmd-palette__footer font-mono">
          <kbd>↑</kbd>
          <kbd>↓</kbd> navigate · <kbd>↵</kbd> select · <kbd>esc</kbd> close
        </p>
      </div>
    </Command.Dialog>
  );
}
