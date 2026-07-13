import { mapBBoxToOriginal, preprocessForOcr, type PreprocessMeta } from "./preprocess";
import type { OcrLine, OcrResult, OcrWord } from "./types";

export type OcrProgress = {
  status: string;
  progress: number;
};

export { preprocessForOcr, mapBBoxToOriginal };
export type { PreprocessMeta };

/** @deprecated Prefer preprocessForOcr — kept for call-site compatibility. */
export function prepareOcrCanvas(source: HTMLCanvasElement | HTMLImageElement): HTMLCanvasElement {
  return preprocessForOcr(source).canvas;
}

function toBox(bbox: { x0: number; y0: number; x1: number; y1: number }) {
  return {
    x0: bbox.x0,
    y0: bbox.y0,
    x1: bbox.x1,
    y1: bbox.y1,
  };
}

type RawPass = {
  text: string;
  lines: OcrLine[];
  words: OcrWord[];
  meanWordConfidence: number;
  psm: string | number;
};

function meanWordConfidence(words: OcrWord[]): number {
  if (!words.length) return 0;
  return words.reduce((sum, w) => sum + w.confidence, 0) / words.length;
}

/** Node-canvas canvases need a PNG buffer; browsers can pass the canvas. */
async function toRecognizeInput(
  source: HTMLCanvasElement | HTMLImageElement,
): Promise<HTMLCanvasElement | HTMLImageElement | Buffer> {
  const maybeBuffer = (
    source as HTMLCanvasElement & { toBuffer?: (mime?: string) => Buffer }
  ).toBuffer;
  if (typeof maybeBuffer === "function") {
    return maybeBuffer.call(source, "image/png");
  }
  return source;
}

function mapPassToOriginal(pass: RawPass, meta: PreprocessMeta): OcrResult {
  const words: OcrWord[] = pass.words.map((w) => ({
    ...w,
    bbox: mapBBoxToOriginal(w.bbox, meta),
  }));

  const lines: OcrLine[] = pass.lines.map((line) => ({
    ...line,
    bbox: mapBBoxToOriginal(line.bbox, meta),
    words: line.words.map((w) => ({
      ...w,
      bbox: mapBBoxToOriginal(w.bbox, meta),
    })),
  }));

  const meanConfidence = lines.length
    ? lines.reduce((sum, l) => sum + l.confidence, 0) / lines.length
    : pass.meanWordConfidence;

  return {
    width: meta.originalWidth,
    height: meta.originalHeight,
    text: pass.text,
    lines,
    words,
    meanConfidence,
  };
}

function parseRecognizeData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  psm: string | number,
): RawPass {
  const mappedLines: OcrLine[] = [];
  const mappedWords: OcrWord[] = [];
  let lineIndex = 0;

  for (const block of data.blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        const lineWords: OcrWord[] = (line.words ?? [])
          .filter((w: { text?: string }) => w.text?.trim())
          .map((w: { text: string; confidence?: number; bbox: OcrWord["bbox"] }) => ({
            text: w.text.trim(),
            confidence: (w.confidence ?? 0) / 100,
            bbox: toBox(w.bbox),
          }))
          // Drop speck-sized noise boxes; keep low-confidence real tokens.
          .filter((w: OcrWord) => {
            const bw = w.bbox.x1 - w.bbox.x0;
            const bh = w.bbox.y1 - w.bbox.y0;
            return bw >= 4 && bh >= 6 && w.text.length > 0;
          });

        mappedWords.push(...lineWords);

        if (!line.text?.trim()) continue;
        mappedLines.push({
          id: `line-${lineIndex++}`,
          text: line.text.trim(),
          confidence: (line.confidence ?? 0) / 100,
          bbox: toBox(line.bbox),
          words: lineWords.length
            ? lineWords
            : [
                {
                  text: line.text.trim(),
                  confidence: (line.confidence ?? 0) / 100,
                  bbox: toBox(line.bbox),
                },
              ],
        });
      }
    }
  }

  return {
    text: String(data.text ?? "").trim(),
    lines: mappedLines,
    words: mappedWords,
    meanWordConfidence: meanWordConfidence(mappedWords),
    psm,
  };
}

function scorePass(pass: RawPass): number {
  const wordBonus = Math.min(pass.words.length, 80) / 80;
  return pass.meanWordConfidence * 0.85 + wordBonus * 0.15;
}

/**
 * First-pass mean word confidence above this skips extra PSM runs.
 * Tuned so clean samples usually finish in one pass.
 */
const CONFIDENT_PASS_THRESHOLD = 0.78;

type PsmPass = { psm: string | number; label: string };

function resultFromRaw(pass: RawPass, width: number, height: number): OcrResult {
  const meanConfidence = pass.lines.length
    ? pass.lines.reduce((sum, l) => sum + l.confidence, 0) / pass.lines.length
    : pass.meanWordConfidence;

  return {
    width,
    height,
    text: pass.text,
    lines: pass.lines,
    words: pass.words,
    meanConfidence,
  };
}

/**
 * Run Tesseract.js with preprocessing + confidence-gated multi-pass PSM.
 * Worker is created per call and terminated afterward.
 */
export async function runOcr(
  source: HTMLCanvasElement | HTMLImageElement,
  onProgress?: (progress: OcrProgress) => void,
): Promise<OcrResult> {
  const Tesseract = await import("tesseract.js");

  onProgress?.({ status: "preprocessing image…", progress: 0.04 });
  const prepared = preprocessForOcr(source);
  const meta = prepared.meta;
  const ocrSource = prepared.canvas;

  const worker = await Tesseract.createWorker("eng", 1);

  const passes: PsmPass[] = [
    { psm: Tesseract.PSM.SINGLE_BLOCK, label: "reading text…" },
    { psm: Tesseract.PSM.SPARSE_TEXT, label: "trying alternate layouts…" },
    { psm: Tesseract.PSM.AUTO, label: "trying auto layout…" },
  ];

  try {
    let best: RawPass | null = null;
    let ran = 0;

    for (let i = 0; i < passes.length; i++) {
      const { psm, label } = passes[i];

      if (i > 0 && best && best.meanWordConfidence >= CONFIDENT_PASS_THRESHOLD && best.words.length >= 8) {
        break;
      }

      ran++;
      const passBase = 0.08 + (i / passes.length) * 0.9;
      const passSpan = 0.9 / passes.length;
      onProgress?.({ status: label, progress: passBase });

      await worker.setParameters({
        // tesseract.js types PSM as an enum; values are numeric strings under the hood.
        tessedit_pageseg_mode: psm as Parameters<
          typeof worker.setParameters
        >[0]["tessedit_pageseg_mode"],
        preserve_interword_spaces: "1",
      });

      const result = await worker.recognize(await toRecognizeInput(ocrSource), undefined, {
        text: true,
        blocks: true,
      });

      const parsed = parseRecognizeData(result.data, psm);
      onProgress?.({ status: label, progress: Math.min(0.98, passBase + passSpan) });

      if (!best || scorePass(parsed) > scorePass(best)) {
        best = {
          ...parsed,
          lines: parsed.lines.map((line, idx) => ({ ...line, id: `line-${idx}` })),
        };
      }
    }

    if (!best) {
      return {
        width: meta.originalWidth,
        height: meta.originalHeight,
        text: "",
        lines: [],
        words: [],
        meanConfidence: 0,
      };
    }

    onProgress?.({
      status: ran > 1 ? "chose best layout" : "done",
      progress: 1,
    });

    return mapPassToOriginal(best, meta);
  } finally {
    await worker.terminate();
  }
}

/**
 * Single-pass OCR with optional preprocessing — for benchmarks / A-B checks.
 */
export async function runOcrSinglePass(
  source: HTMLCanvasElement | HTMLImageElement,
  options: {
    preprocess: boolean;
    psm: string | number;
  },
): Promise<OcrResult & { meanWordConfidence: number; elapsedMs: number }> {
  const Tesseract = await import("tesseract.js");
  const started = performance.now();

  let ocrSource: HTMLCanvasElement | HTMLImageElement = source;
  let meta: PreprocessMeta | null = null;
  if (options.preprocess) {
    const prepared = preprocessForOcr(source);
    ocrSource = prepared.canvas;
    meta = prepared.meta;
  }

  const worker = await Tesseract.createWorker("eng", 1);
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: options.psm as Parameters<
        typeof worker.setParameters
      >[0]["tessedit_pageseg_mode"],
      preserve_interword_spaces: "1",
    });
    const result = await worker.recognize(await toRecognizeInput(ocrSource), undefined, {
      text: true,
      blocks: true,
    });
    const parsed = parseRecognizeData(result.data, options.psm);
    const mapped = meta
      ? mapPassToOriginal(parsed, meta)
      : resultFromRaw(
          parsed,
          "width" in source ? Number(source.width) : 0,
          "height" in source ? Number(source.height) : 0,
        );

    return {
      ...mapped,
      meanWordConfidence: parsed.meanWordConfidence,
      elapsedMs: performance.now() - started,
    };
  } finally {
    await worker.terminate();
  }
}
