"use client";

import { useMemo, useState } from "react";
import { detectPatterns } from "@/lib/ocr/detect-patterns";
import {
  CONFIDENCE_COLORS,
  UNCERTAIN_CONFIDENCE,
  confidenceLevel,
  type DetectedPattern,
  type OcrResult,
} from "@/lib/ocr/types";

type Props = {
  ocr: OcrResult | null;
  sourceLabel?: string | null;
  activeLineId: string | null;
  onSelectLine: (id: string | null) => void;
};

function PatternChip({ pattern, onFocus }: { pattern: DetectedPattern; onFocus: () => void }) {
  return (
    <button type="button" className="ocr-chip font-mono" onClick={onFocus}>
      <span className="ocr-chip__kind">{pattern.label}</span>
      <span className="ocr-chip__value">{pattern.value}</span>
    </button>
  );
}

export function TextPanel({ ocr, sourceLabel, activeLineId, onSelectLine }: Props) {
  const [copied, setCopied] = useState(false);
  const patterns = useMemo(() => (ocr ? detectPatterns(ocr.lines) : []), [ocr]);

  if (!ocr) {
    return (
      <aside className="ocr-textpanel" aria-label="Extracted text">
        <p className="lab-field__label font-mono">Extracted text</p>
        <p className="ocr-textpanel__empty">
          Upload any photo of text — print, screenshots, notes, documents. Lines appear here with
          per-line OCR confidence.
        </p>
      </aside>
    );
  }

  const meanPct = Math.round(ocr.meanConfidence * 100);
  const meanLevel = confidenceLevel(ocr.meanConfidence);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(ocr.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <aside className="ocr-textpanel" aria-label="Extracted text">
      <div className="ocr-textpanel__header">
        <div>
          <p className="lab-field__label font-mono">Extracted text</p>
          {sourceLabel ? <p className="ocr-textpanel__source font-mono">{sourceLabel}</p> : null}
        </div>
        <div className="ocr-textpanel__meta font-mono">
          <span style={{ color: CONFIDENCE_COLORS[meanLevel] }}>{meanPct}% avg</span>
          <span>{ocr.lines.length} lines</span>
        </div>
      </div>

      {ocr.meanConfidence < UNCERTAIN_CONFIDENCE ? (
        <p className="ocr-textpanel__warn font-mono" role="status">
          Average OCR confidence is low — expect noisy characters on blurry or skewed photos.
        </p>
      ) : null}

      {patterns.length > 0 ? (
        <div className="ocr-textpanel__patterns">
          <p className="lab-field__label font-mono">Pattern hints</p>
          <div className="ocr-chips">
            {patterns.map((pattern) => (
              <PatternChip
                key={`${pattern.kind}-${pattern.value}`}
                pattern={pattern}
                onFocus={() => onSelectLine(pattern.lineId)}
              />
            ))}
          </div>
          <p className="ocr-textpanel__hint font-mono">
            Regex hits only — not classified document fields.
          </p>
        </div>
      ) : null}

      <div className="ocr-textpanel__actions">
        <button type="button" className="lab-btn font-mono" onClick={copyAll}>
          {copied ? "Copied" : "Copy all"}
        </button>
      </div>

      <ul className="ocr-lines" aria-label="OCR lines">
        {ocr.lines.map((line) => {
          const level = confidenceLevel(line.confidence);
          const active = line.id === activeLineId;
          return (
            <li key={line.id}>
              <button
                type="button"
                className={`ocr-line${active ? " is-active" : ""}`}
                onClick={() => onSelectLine(active ? null : line.id)}
                aria-pressed={active}
              >
                <span
                  className="ocr-line__conf font-mono"
                  style={{ color: CONFIDENCE_COLORS[level] }}
                >
                  {Math.round(line.confidence * 100)}
                </span>
                <span className="ocr-line__text">{line.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <details className="ocr-transcript">
        <summary className="ocr-transcript__summary font-mono">Full transcript</summary>
        <pre className="ocr-transcript__body font-mono">{ocr.text || "(empty)"}</pre>
      </details>
    </aside>
  );
}
