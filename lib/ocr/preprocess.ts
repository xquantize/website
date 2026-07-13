/**
 * Canvas preprocessing for Tesseract. Display stays on the original image;
 * boxes from OCR are mapped back via {@link PreprocessMeta}.
 */

export type PreprocessMeta = {
  originalWidth: number;
  originalHeight: number;
  processedWidth: number;
  processedHeight: number;
  /** Width/height after upscale, before deskew expand. */
  scaledWidth: number;
  scaledHeight: number;
  /** Uniform upscale applied before deskew. */
  scale: number;
  /** Deskew rotation applied (degrees, CCW positive). */
  angleDeg: number;
  /** Padding added when expanding canvas to fit the rotated image. */
  padX: number;
  padY: number;
};

export type PreprocessResult = {
  canvas: HTMLCanvasElement;
  meta: PreprocessMeta;
};

/** Target min edge ≈ 150 DPI equivalent for phone-width document scans. */
const MIN_EDGE_PX = 1400;
const MAX_SCALE = 3.5;
const SKEW_SEARCH_DEG = 10;
const SKEW_STEP_DEG = 0.5;

/** Browser uses document; Node benches may inject `__ocrCreateCanvas`. */
function createCanvas(width = 1, height = 1): HTMLCanvasElement {
  const factory = (globalThis as unknown as {
    __ocrCreateCanvas?: (w: number, h: number) => HTMLCanvasElement;
  }).__ocrCreateCanvas;

  if (factory) {
    const canvas = factory(width, height);
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function sourceSize(source: HTMLCanvasElement | HTMLImageElement) {
  const anySource = source as HTMLCanvasElement & HTMLImageElement;
  const width = Number(anySource.naturalWidth || anySource.width || 0);
  const height = Number(anySource.naturalHeight || anySource.height || 0);
  return { width, height };
}

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Standard Otsu threshold on an 8-bit grayscale histogram. */
export function otsuThreshold(histogram: Uint32Array, totalPixels: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];

  let sumB = 0;
  let wB = 0;
  let maxVar = -1;
  let threshold = 127;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    const wF = totalPixels - wB;
    if (wF === 0) break;
    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > maxVar) {
      maxVar = between;
      threshold = t;
    }
  }
  return threshold;
}

function buildHistogram(gray: Uint8ClampedArray): { hist: Uint32Array; total: number } {
  const hist = new Uint32Array(256);
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++;
  return { hist, total: gray.length };
}

function imageDataToGray(data: Uint8ClampedArray): Uint8ClampedArray {
  const gray = new Uint8ClampedArray(data.length / 4);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = luminance(data[i], data[i + 1], data[i + 2]);
  }
  return gray;
}

/** Percentile contrast stretch on grayscale (helps before Otsu on flat scans). */
function stretchGray(gray: Uint8ClampedArray, lowPct = 2, highPct = 98): Uint8ClampedArray {
  const hist = new Uint32Array(256);
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++;

  const lowCount = (lowPct / 100) * gray.length;
  const highCount = (highPct / 100) * gray.length;
  let lo = 0;
  let hi = 255;
  let acc = 0;
  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    if (acc >= lowCount) {
      lo = i;
      break;
    }
  }
  acc = 0;
  for (let i = 255; i >= 0; i--) {
    acc += hist[i];
    if (acc >= gray.length - highCount) {
      hi = i;
      break;
    }
  }
  const range = Math.max(1, hi - lo);
  const out = new Uint8ClampedArray(gray.length);
  for (let i = 0; i < gray.length; i++) {
    out[i] = Math.max(0, Math.min(255, ((gray[i] - lo) / range) * 255));
  }
  return out;
}

/**
 * Score candidate skew by how tightly ink packs vertically after a virtual
 * rotation. Level text → minimal AABB height (and high projection variance).
 */
function inkPackingHeight(
  binary: Uint8Array,
  width: number,
  height: number,
  angleDeg: number,
): number {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const cx = width / 2;
  const cy = height / 2;
  let minY = Infinity;
  let maxY = -Infinity;
  let counted = 0;
  const step = Math.max(1, Math.floor(Math.sqrt(width * height) / 200));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (binary[y * width + x] !== 0) continue;
      const dx = x - cx;
      const dy = y - cy;
      const ry = -dx * sin + dy * cos;
      if (ry < minY) minY = ry;
      if (ry > maxY) maxY = ry;
      counted++;
    }
  }
  if (counted < 40) return Number.POSITIVE_INFINITY;
  return maxY - minY;
}

function estimateSkewDeg(gray: Uint8ClampedArray, width: number, height: number): number {
  // Downsample for skew search.
  const maxW = 420;
  const ds = width > maxW ? width / maxW : 1;
  const dw = Math.max(1, Math.round(width / ds));
  const dh = Math.max(1, Math.round(height / ds));
  const small = new Uint8ClampedArray(dw * dh);
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const sx = Math.min(width - 1, Math.round(x * ds));
      const sy = Math.min(height - 1, Math.round(y * ds));
      small[y * dw + x] = gray[sy * width + sx];
    }
  }

  const { hist, total } = buildHistogram(small);
  const t = otsuThreshold(hist, total);
  // Skew only cares about dark glyph ink — start from a conservative cut and
  // adjust until the ink fraction looks like text (not paper margins).
  let inkCut = Math.max(8, Math.round(t * 0.55));
  const inkCount = (cut: number) => {
    let n = 0;
    for (let i = 0; i < small.length; i++) {
      if (small[i] <= cut) n++;
    }
    return n;
  };
  let dark = inkCount(inkCut);
  while (dark / total > 0.14 && inkCut > 6) {
    inkCut -= 2;
    dark = inkCount(inkCut);
  }
  while (dark / total < 0.015 && inkCut < Math.min(250, t + 20)) {
    inkCut += 2;
    dark = inkCount(inkCut);
  }
  const binary = new Uint8Array(small.length);
  for (let i = 0; i < small.length; i++) {
    binary[i] = small[i] <= inkCut ? 0 : 255;
  }

  const height0 = inkPackingHeight(binary, dw, dh, 0);
  let bestAngle = 0;
  let bestHeight = height0;

  for (let a = -SKEW_SEARCH_DEG; a <= SKEW_SEARCH_DEG + 1e-6; a += SKEW_STEP_DEG) {
    if (Math.abs(a) < 0.25) continue;
    const hPack = inkPackingHeight(binary, dw, dh, a);
    if (hPack < bestHeight) {
      bestHeight = hPack;
      bestAngle = a;
    }
  }

  // Only deskew when packing clearly improves (lower is better).
  if (!(bestHeight < height0 * 0.96)) return 0;
  if (Math.abs(bestAngle) < 0.75) return 0;

  const neighbor = Math.min(
    inkPackingHeight(binary, dw, dh, bestAngle - SKEW_STEP_DEG),
    inkPackingHeight(binary, dw, dh, bestAngle + SKEW_STEP_DEG),
  );
  // Reject if not a local minimum.
  if (bestHeight > neighbor * 1.02) return 0;

  return Math.round(bestAngle * 2) / 2;
}

function grayToImageData(gray: Uint8ClampedArray, width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0, j = 0; i < gray.length; i++, j += 4) {
    const v = gray[i];
    data[j] = v;
    data[j + 1] = v;
    data[j + 2] = v;
    data[j + 3] = 255;
  }
  return new ImageData(data, width, height);
}

function rotateExpand(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  angleDeg: number,
): { gray: Uint8ClampedArray; width: number; height: number; padX: number; padY: number } {
  if (Math.abs(angleDeg) < 0.05) {
    return { gray, width, height, padX: 0, padY: 0 };
  }

  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const corners = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
  const cx = width / 2;
  const cy = height / 2;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of corners) {
    const dx = x - cx;
    const dy = y - cy;
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    minX = Math.min(minX, rx);
    maxX = Math.max(maxX, rx);
    minY = Math.min(minY, ry);
    maxY = Math.max(maxY, ry);
  }
  const outW = Math.ceil(maxX - minX);
  const outH = Math.ceil(maxY - minY);
  const padX = -minX;
  const padY = -minY;
  const out = new Uint8ClampedArray(outW * outH);
  // Fill with paper white.
  out.fill(255);

  const cosI = Math.cos(-rad);
  const sinI = Math.sin(-rad);
  const ocx = cx;
  const ocy = cy;

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const dx = x - padX;
      const dy = y - padY;
      const sx = dx * cosI - dy * sinI + ocx;
      const sy = dx * sinI + dy * cosI + ocy;
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      if (x0 < 0 || y0 < 0 || x0 + 1 >= width || y0 + 1 >= height) continue;
      const fx = sx - x0;
      const fy = sy - y0;
      const i00 = y0 * width + x0;
      const v =
        gray[i00] * (1 - fx) * (1 - fy) +
        gray[i00 + 1] * fx * (1 - fy) +
        gray[i00 + width] * (1 - fx) * fy +
        gray[i00 + width + 1] * fx * fy;
      out[y * outW + x] = v;
    }
  }

  return { gray: out, width: outW, height: outH, padX, padY };
}

function binarizeOtsu(gray: Uint8ClampedArray): Uint8ClampedArray {
  const { hist, total } = buildHistogram(gray);
  const t = otsuThreshold(hist, total);
  let dark = 0;
  for (let i = 0; i < gray.length; i++) {
    if (gray[i] < t) dark++;
  }
  // Force dark text on white for Tesseract.
  const inkIsDark = dark < total * 0.5;
  const out = new Uint8ClampedArray(gray.length);
  for (let i = 0; i < gray.length; i++) {
    const isInk = inkIsDark ? gray[i] < t : gray[i] >= t;
    out[i] = isInk ? 0 : 255;
  }
  return out;
}

/** Reject speckly Otsu results (busy paper texture) — fall back to gray. */
function inkFraction(binary: Uint8ClampedArray): number {
  let ink = 0;
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] < 128) ink++;
  }
  return ink / binary.length;
}

function boxBlurGray(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
): Uint8ClampedArray {
  if (radius < 1) return gray;
  const out = new Uint8ClampedArray(gray.length);
  const tmp = new Float64Array(gray.length);
  const r = Math.floor(radius);

  // Horizontal
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let n = 0;
      for (let k = -r; k <= r; k++) {
        const xx = x + k;
        if (xx < 0 || xx >= width) continue;
        sum += gray[y * width + xx];
        n++;
      }
      tmp[y * width + x] = sum / n;
    }
  }
  // Vertical
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let n = 0;
      for (let k = -r; k <= r; k++) {
        const yy = y + k;
        if (yy < 0 || yy >= height) continue;
        sum += tmp[yy * width + x];
        n++;
      }
      out[y * width + x] = sum / n;
    }
  }
  return out;
}

/**
 * LSTM engines prefer grayscale. Use hard Otsu only when contrast is poor
 * AND the resulting ink fraction looks like real text (not texture noise).
 */
function enhanceForOcr(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8ClampedArray {
  const { hist, total } = buildHistogram(gray);
  let lo = 0;
  let hi = 255;
  let acc = 0;
  const tail = 0.02 * total;
  for (let i = 0; i < 256; i++) {
    acc += hist[i];
    if (acc >= tail) {
      lo = i;
      break;
    }
  }
  acc = 0;
  for (let i = 255; i >= 0; i--) {
    acc += hist[i];
    if (acc >= tail) {
      hi = i;
      break;
    }
  }

  const span = Math.max(1, hi - lo);

  // Washed / busy scans: blur kills paper texture before stretch/Otsu.
  let working = gray;
  if (span < 140) {
    const radius = span < 70 ? 3 : span < 100 ? 2 : 1;
    working = boxBlurGray(gray, width, height, radius);
    working = stretchGray(working, 1, 99);
  } else {
    working = stretchGray(gray);
  }

  const hist2 = buildHistogram(working);
  let lo2 = 0;
  let hi2 = 255;
  acc = 0;
  for (let i = 0; i < 256; i++) {
    acc += hist2.hist[i];
    if (acc >= 0.02 * hist2.total) {
      lo2 = i;
      break;
    }
  }
  acc = 0;
  for (let i = 255; i >= 0; i--) {
    acc += hist2.hist[i];
    if (acc >= 0.02 * hist2.total) {
      hi2 = i;
      break;
    }
  }
  void lo2;
  void hi2;

  // Low native contrast → prefer conservative Otsu (darker-only ink) + despeckle.
  if (span < 100) {
    const { hist: h3, total: t3 } = buildHistogram(working);
    const t = otsuThreshold(h3, t3);
    // Bias threshold toward darker ink so paper texture stays white.
    const cut = Math.max(0, Math.min(255, Math.round(t * 0.82)));
    const binary = new Uint8ClampedArray(working.length);
    for (let i = 0; i < working.length; i++) {
      binary[i] = working[i] < cut ? 0 : 255;
    }
    const cleaned = despeckleInk(binary, width, height);
    const frac = inkFraction(cleaned);
    if (frac >= 0.01 && frac <= 0.18) return cleaned;
    return working;
  }

  return working;
}

/** Remove isolated ink speckles; then morphological open to kill salt noise. */
function despeckleInk(
  binary: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8ClampedArray {
  let cur = new Uint8ClampedArray(binary.length);
  cur.set(binary);

  // Two majority-filter passes.
  for (let pass = 0; pass < 2; pass++) {
    const next = new Uint8ClampedArray(cur.length);
    next.set(cur);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        if (cur[i] !== 0) continue;
        let inkNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            if (cur[(y + dy) * width + (x + dx)] === 0) inkNeighbors++;
          }
        }
        if (inkNeighbors < 4) next[i] = 255;
      }
    }
    cur = next;
  }

  // Erode then dilate (open) — drops thin speckles, keeps stroke mass.
  const eroded = new Uint8ClampedArray(cur.length);
  eroded.fill(255);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (cur[i] !== 0) continue;
      let allInk = true;
      for (let dy = -1; dy <= 1 && allInk; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (cur[(y + dy) * width + (x + dx)] !== 0) {
            allInk = false;
            break;
          }
        }
      }
      if (allInk) eroded[i] = 0;
    }
  }

  const opened = new Uint8ClampedArray(eroded.length);
  opened.fill(255);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      let anyInk = eroded[i] === 0;
      if (!anyInk) {
        for (let dy = -1; dy <= 1 && !anyInk; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (eroded[(y + dy) * width + (x + dx)] === 0) {
              anyInk = true;
              break;
            }
          }
        }
      }
      if (anyInk) opened[i] = 0;
    }
  }

  return opened;
}

/**
 * Prepare an image for OCR. Returns an enhanced canvas plus transform metadata
 * so bounding boxes can be mapped back onto the original photo.
 */
export function preprocessForOcr(
  source: HTMLCanvasElement | HTMLImageElement,
): PreprocessResult {
  const { width: origW, height: origH } = sourceSize(source);
  if (!origW || !origH) throw new Error("Image has no dimensions.");

  const minEdge = Math.min(origW, origH);
  const scale = minEdge < MIN_EDGE_PX ? Math.min(MAX_SCALE, MIN_EDGE_PX / minEdge) : 1;
  const scaledW = Math.round(origW * scale);
  const scaledH = Math.round(origH * scale);

  const scratch = createCanvas(scaledW, scaledH);
  const sctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!sctx) throw new Error("Canvas unavailable.");
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(source, 0, 0, scaledW, scaledH);

  const raw = sctx.getImageData(0, 0, scaledW, scaledH);
  const rawGray = imageDataToGray(raw.data);
  // Skew on unstretched luminance — percentile stretch can crush gray
  // photo margins into the same bin as ink and break deskew.
  const angleDeg = estimateSkewDeg(rawGray, scaledW, scaledH);
  const rotated = rotateExpand(rawGray, scaledW, scaledH, angleDeg);
  const gray = enhanceForOcr(rotated.gray, rotated.width, rotated.height);

  const canvas = createCanvas(rotated.width, rotated.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");
  ctx.putImageData(grayToImageData(gray, rotated.width, rotated.height), 0, 0);

  return {
    canvas,
    meta: {
      originalWidth: origW,
      originalHeight: origH,
      processedWidth: rotated.width,
      processedHeight: rotated.height,
      scaledWidth: scaledW,
      scaledHeight: scaledH,
      scale,
      angleDeg,
      padX: rotated.padX,
      padY: rotated.padY,
    },
  };
}

export type Point = { x: number; y: number };

/** Map a point from processed (OCR) space into original image pixels. */
export function mapPointToOriginal(x: number, y: number, meta: PreprocessMeta): Point {
  const {
    scale,
    angleDeg,
    padX,
    padY,
    originalWidth,
    originalHeight,
    scaledWidth,
    scaledHeight,
  } = meta;

  // No deskew: processed space is just the upscaled image (top-left origin).
  // Do not add the rotation center — that only applies after rotateExpand.
  if (Math.abs(angleDeg) < 0.05) {
    return {
      x: (x / scaledWidth) * originalWidth,
      y: (y / scaledHeight) * originalHeight,
    };
  }

  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(-rad);
  const sin = Math.sin(-rad);
  const scx = scaledWidth / 2;
  const scy = scaledHeight / 2;

  const rx = x - padX;
  const ry = y - padY;
  const sx = rx * cos - ry * sin + scx;
  const sy = rx * sin + ry * cos + scy;

  return {
    x: (sx / scaledWidth) * originalWidth,
    y: (sy / scaledHeight) * originalHeight,
  };
}

/** Axis-aligned bbox in original space covering the mapped processed box. */
export function mapBBoxToOriginal(
  bbox: { x0: number; y0: number; x1: number; y1: number },
  meta: PreprocessMeta,
): { x0: number; y0: number; x1: number; y1: number } {
  const corners = [
    mapPointToOriginal(bbox.x0, bbox.y0, meta),
    mapPointToOriginal(bbox.x1, bbox.y0, meta),
    mapPointToOriginal(bbox.x1, bbox.y1, meta),
    mapPointToOriginal(bbox.x0, bbox.y1, meta),
  ];
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  return {
    x0: Math.max(0, Math.min(...xs)),
    y0: Math.max(0, Math.min(...ys)),
    x1: Math.min(meta.originalWidth, Math.max(...xs)),
    y1: Math.min(meta.originalHeight, Math.max(...ys)),
  };
}
