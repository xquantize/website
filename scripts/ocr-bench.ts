/**
 * OCR robustness bench (Node + canvas polyfill).
 * Compares legacy mild stretch vs full preprocess, and multi-pass impact.
 *
 * Usage: npx tsx scripts/ocr-bench.ts
 */
import { createCanvas, loadImage, ImageData as CanvasImageData } from "canvas";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

(globalThis as unknown as { ImageData: typeof CanvasImageData }).ImageData = CanvasImageData;
(globalThis as unknown as {
  __ocrCreateCanvas: (w: number, h: number) => ReturnType<typeof createCanvas>;
}).__ocrCreateCanvas = (w, h) => createCanvas(Math.max(1, w), Math.max(1, h));

async function main() {
  const { preprocessForOcr } = await import("../lib/ocr/preprocess");
  const { runOcr, runOcrSinglePass } = await import("../lib/ocr/run-ocr");
  const Tesseract = await import("tesseract.js");

  const root = resolve("public/work/receipt-ocr");
  const samples = [
    "sample-cafe.png",
    "sample-invoice.png",
    "sample-retail.png",
    "sample-cafe-skewed.png",
    "sample-cafe-lowcontrast.png",
    "sample-retail-lowres.png",
  ];

  /** Legacy prepare: upscale + contrast stretch only (pre-robustness). */
  function legacyPrepare(img: Awaited<ReturnType<typeof loadImage>>) {
    const srcW = img.width;
    const srcH = img.height;
    const minEdge = Math.min(srcW, srcH);
    const scale = minEdge < 900 ? Math.min(2.2, 1100 / minEdge) : 1;
    const canvas = createCanvas(Math.round(srcW * scale), Math.round(srcH * scale));
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = image.data;
    let min = 255;
    let max = 0;
    for (let i = 0; i < data.length; i += 4) {
      const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (y < min) min = y;
      if (y > max) max = y;
    }
    const range = Math.max(1, max - min);
    for (let i = 0; i < data.length; i += 4) {
      const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const v = Math.max(0, Math.min(255, ((y - min) / range) * 255));
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
    ctx.putImageData(image, 0, 0);
    return canvas;
  }

  console.log("OCR robustness bench\n");

  type Row = {
    sample: string;
    legacyWords: number;
    legacyMean: number;
    legacyMs: number;
    newWords: number;
    newMean: number;
    newMs: number;
    multiWords: number;
    multiMean: number;
    multiMs: number;
    angle: number;
    scale: number;
  };
  const rows: Row[] = [];

  for (const name of samples) {
    const path = resolve(root, name);
    readFileSync(path);
    const img = await loadImage(path);
    const htmlLike = img as unknown as HTMLImageElement;

    const legacyCanvas = legacyPrepare(img);
    const t0 = performance.now();
    const legacy = await runOcrSinglePass(legacyCanvas as unknown as HTMLCanvasElement, {
      preprocess: false,
      psm: Tesseract.PSM.AUTO,
    });
    const legacyMs = performance.now() - t0;

    const meta = preprocessForOcr(htmlLike);
    const t1 = performance.now();
    const single = await runOcrSinglePass(htmlLike, {
      preprocess: true,
      psm: Tesseract.PSM.SINGLE_BLOCK,
    });
    const singleMs = performance.now() - t1;

    const t2 = performance.now();
    const multi = await runOcr(htmlLike);
    const multiMs = performance.now() - t2;

    rows.push({
      sample: name.replace("sample-", "").replace(".png", ""),
      legacyWords: legacy.words.length,
      legacyMean: legacy.meanWordConfidence,
      legacyMs,
      newWords: single.words.length,
      newMean: single.meanWordConfidence,
      newMs: singleMs,
      multiWords: multi.words.length,
      multiMean: multi.meanConfidence,
      multiMs,
      angle: meta.meta.angleDeg,
      scale: meta.meta.scale,
    });

    console.log(
      `${name}: legacy ${legacy.words.length}w @${(legacy.meanWordConfidence * 100).toFixed(1)}% ${legacyMs.toFixed(0)}ms | ` +
        `prep+PSM6 ${single.words.length}w @${(single.meanWordConfidence * 100).toFixed(1)}% ${singleMs.toFixed(0)}ms | ` +
        `multi ${multi.words.length}w @${(multi.meanConfidence * 100).toFixed(1)}% ${multiMs.toFixed(0)}ms | ` +
        `skew=${meta.meta.angleDeg.toFixed(1)}° scale=${meta.meta.scale.toFixed(2)}`,
    );
  }

  console.log("\n--- Summary ---");
  const hard = rows.filter((r) =>
    ["cafe-skewed", "cafe-lowcontrast", "retail-lowres"].includes(r.sample),
  );
  const clean = rows.filter((r) => ["cafe", "invoice", "retail"].includes(r.sample));

  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

  console.log(
    `Hard cases word count: legacy ${avg(hard.map((r) => r.legacyWords)).toFixed(1)} → preprocess ${avg(hard.map((r) => r.newWords)).toFixed(1)} → multi ${avg(hard.map((r) => r.multiWords)).toFixed(1)}`,
  );
  console.log(
    `Hard cases mean conf:  legacy ${(avg(hard.map((r) => r.legacyMean)) * 100).toFixed(1)}% → preprocess ${(avg(hard.map((r) => r.newMean)) * 100).toFixed(1)}% → multi ${(avg(hard.map((r) => r.multiMean)) * 100).toFixed(1)}%`,
  );
  console.log(
    `Clean samples multi latency: ${avg(clean.map((r) => r.multiMs)).toFixed(0)}ms avg (legacy single ${avg(clean.map((r) => r.legacyMs)).toFixed(0)}ms)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
