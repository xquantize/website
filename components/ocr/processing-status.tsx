"use client";

type Props = {
  phase: "idle" | "loading-image" | "ocr" | "structuring" | "done" | "error";
  progress: number;
  status: string;
  reducedMotion?: boolean;
};

const PHASE_COPY: Record<string, string> = {
  idle: "Waiting",
  "loading-image": "Loading image…",
  ocr: "Reading text…",
  structuring: "Organizing…",
  done: "Done",
  error: "Failed",
};

export function ProcessingStatus({ phase, progress, status, reducedMotion }: Props) {
  if (phase === "idle" || phase === "done") return null;

  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);
  const label =
    phase === "ocr" && status
      ? status.replace(/_/g, " ")
      : phase === "loading-image"
        ? PHASE_COPY[phase]
        : PHASE_COPY[phase] ?? "Working…";

  return (
    <div
      className={`ocr-status${reducedMotion ? " ocr-status--static" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy={phase !== "error"}
    >
      <div className="ocr-status__row font-mono">
        <span>{label}</span>
        {phase === "ocr" ? <span>{pct}%</span> : null}
      </div>
      <div className="ocr-status__track" aria-hidden>
        <div
          className="ocr-status__fill"
          style={{ width: phase === "error" ? "100%" : `${Math.max(pct, 6)}%` }}
        />
      </div>
    </div>
  );
}
