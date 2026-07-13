import type { DetectedPattern, OcrLine } from "./types";

const DATE_RE =
  /\b(?:\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}|\d{4}[\/.\-]\d{1,2}[\/.\-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{2,4})\b/gi;

const AMOUNT_RE =
  /(?:USD|NZD|AUD|EUR|GBP|\$|€|£)\s*-?\d{1,3}(?:,\d{3})*(?:\.\d{2})?|-?\d{1,3}(?:,\d{3})*\.\d{2}\b/g;

const PHONE_RE = /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)\d{3,4}[\s.-]?\d{3,4}\b/g;

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

const URL_RE = /\b(?:https?:\/\/|www\.)[^\s]+/gi;

/**
 * Soft pattern hints only — not field assignment. Surfaces recognizable
 * tokens in the transcript without claiming document structure.
 */
export function detectPatterns(lines: OcrLine[]): DetectedPattern[] {
  const found: DetectedPattern[] = [];

  const pushMatches = (
    kind: DetectedPattern["kind"],
    label: string,
    re: RegExp,
    text: string,
    lineId: string,
  ) => {
    const matches = text.match(re);
    if (!matches) return;
    for (const value of matches) {
      const trimmed = value.trim();
      if (trimmed.length < 4) continue;
      if (found.some((f) => f.kind === kind && f.value === trimmed)) continue;
      found.push({ kind, label, value: trimmed, lineId });
    }
  };

  for (const line of lines) {
    pushMatches("date", "Date-like", DATE_RE, line.text, line.id);
    pushMatches("amount", "Amount-like", AMOUNT_RE, line.text, line.id);
    pushMatches("email", "Email", EMAIL_RE, line.text, line.id);
    pushMatches("url", "URL", URL_RE, line.text, line.id);
    pushMatches("phone", "Phone-like", PHONE_RE, line.text, line.id);
  }

  return found.slice(0, 12);
}
