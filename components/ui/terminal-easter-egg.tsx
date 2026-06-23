"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion-preference";

const SECRET = "autograd";

const LINES = [
  "$ python train.py",
  "Traceback (most recent call last):",
  '  File "train.py", line 1, in <module>',
  "    import torch",
  "ModuleNotFoundError: No module named 'torch'",
  "",
  "...just kidding.",
  "Scalar autograd lives in the browser →",
] as const;

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function TerminalEasterEgg() {
  const reducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const buffer = useRef("");
  const timers = useRef<number[]>([]);

  const close = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setOpen(false);
    setVisibleLines(0);
    document.body.dataset.terminalOpen = "false";
  }, []);

  const reveal = useCallback(() => {
    if (reducedMotion) return;
    setOpen(true);
    document.body.dataset.terminalOpen = "true";
    setVisibleLines(0);
    LINES.forEach((_, i) => {
      const t = window.setTimeout(() => setVisibleLines(i + 1), 120 + i * 140);
      timers.current.push(t);
    });
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (open) {
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        }
        return;
      }
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return;

      buffer.current = (buffer.current + e.key.toLowerCase()).slice(-SECRET.length);
      if (buffer.current === SECRET) {
        buffer.current = "";
        reveal();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close, reveal, reducedMotion]);

  useEffect(() => () => close(), [close]);

  if (!open) return null;

  return (
    <div
      className="terminal-egg"
      role="dialog"
      aria-modal="true"
      aria-label="Terminal easter egg"
    >
      <button
        type="button"
        className="terminal-egg__backdrop"
        aria-label="Close"
        onClick={close}
      />
      <div className="terminal-egg__panel pointer-events-auto">
        <div className="terminal-egg__chrome font-mono">
          <span>~/portfolio</span>
          <button type="button" className="terminal-egg__close font-mono" onClick={close}>
            esc
          </button>
        </div>
        <pre className="terminal-egg__body font-mono">
          {LINES.slice(0, visibleLines).map((line, i) => (
            <span key={i} className="terminal-egg__line">
              {line || "\u00a0"}
            </span>
          ))}
        </pre>
        {visibleLines >= LINES.length && (
          <Link
            href="/work/autograd-playground"
            className="terminal-egg__cta font-mono"
            onClick={close}
          >
            Open playground →
          </Link>
        )}
      </div>
    </div>
  );
}
