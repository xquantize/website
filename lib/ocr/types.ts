export type BBox = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

export type ConfidenceLevel = "high" | "medium" | "low";

export type OcrWord = {
  text: string;
  confidence: number;
  bbox: BBox;
};

export type OcrLine = {
  id: string;
  text: string;
  confidence: number;
  bbox: BBox;
  words: OcrWord[];
};

export type OcrResult = {
  width: number;
  height: number;
  text: string;
  lines: OcrLine[];
  words: OcrWord[];
  meanConfidence: number;
};

export type DetectedPattern = {
  kind: "date" | "amount" | "phone" | "email" | "url";
  label: string;
  value: string;
  lineId: string;
};

/**
 * Tesseract word confidence below this is treated as uncertain in the overlay
 * (dashed stroke). 0.60 sits above typical garbage (~0.4–0.55) while still
 * flagging words the engine only half-trusts — more honest than only painting
 * line averages.
 */
export const UNCERTAIN_CONFIDENCE = 0.6;

export function confidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.75) return "high";
  if (score >= UNCERTAIN_CONFIDENCE) return "medium";
  return "low";
}

export function isUncertainConfidence(score: number): boolean {
  return score < UNCERTAIN_CONFIDENCE;
}

export const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  high: "#c4a484",
  medium: "#e8b86d",
  low: "#e08a7a",
};
