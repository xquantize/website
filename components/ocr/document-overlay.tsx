"use client";

import { useEffect, useRef } from "react";
import {
  CONFIDENCE_COLORS,
  confidenceLevel,
  isUncertainConfidence,
  type OcrResult,
} from "@/lib/ocr/types";

type Props = {
  imageUrl: string | null;
  ocr: OcrResult | null;
  activeLineId: string | null;
  onSelectLine: (id: string | null) => void;
};

export function DocumentOverlay({ imageUrl, ocr, activeLineId, onSelectLine }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl || !ocr) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const { width, height } = ocr;
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const lineWidth = Math.max(1.5, Math.round(Math.min(width, height) * 0.0035));

      // Soft line fills for active/hover context; strokes are per-word so
      // uncertain tokens read clearly without every box looking equally sure.
      for (const line of ocr.lines) {
        const active = line.id === activeLineId;
        const level = confidenceLevel(line.confidence);
        const color = CONFIDENCE_COLORS[level];
        const w = line.bbox.x1 - line.bbox.x0;
        const h = line.bbox.y1 - line.bbox.y0;

        ctx.save();
        ctx.globalAlpha = active ? 0.22 : 0.08;
        ctx.fillStyle = color;
        ctx.fillRect(line.bbox.x0, line.bbox.y0, w, h);
        ctx.restore();

        for (const word of line.words) {
          const wordLevel = confidenceLevel(word.confidence);
          const wordColor = CONFIDENCE_COLORS[wordLevel];
          const uncertain = isUncertainConfidence(word.confidence);
          const ww = word.bbox.x1 - word.bbox.x0;
          const wh = word.bbox.y1 - word.bbox.y0;

          ctx.save();
          ctx.strokeStyle = wordColor;
          ctx.lineWidth = active ? lineWidth + 0.8 : lineWidth;
          ctx.setLineDash(uncertain ? [5, 4] : []);
          ctx.globalAlpha = uncertain ? 0.95 : active ? 1 : 0.85;
          ctx.strokeRect(word.bbox.x0, word.bbox.y0, ww, wh);
          ctx.restore();
        }
      }
    };
    img.src = imageUrl;
  }, [imageUrl, ocr, activeLineId]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ocr || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = ocr.width / rect.width;
    const scaleY = ocr.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const hit = [...ocr.lines].reverse().find(
      (line) =>
        x >= line.bbox.x0 && x <= line.bbox.x1 && y >= line.bbox.y0 && y <= line.bbox.y1,
    );
    onSelectLine(hit?.id ?? null);
  };

  return (
    <div className="ocr-overlay">
      <div className="ocr-overlay__frame">
        {imageUrl && ocr ? (
          <canvas
            ref={canvasRef}
            className="lab-canvas ocr-overlay__canvas"
            role="img"
            aria-label="Source image with OCR word boxes"
            onClick={handleClick}
          />
        ) : imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="ocr-overlay__preview" />
        ) : (
          <div className="ocr-overlay__empty font-mono">Load an image to begin</div>
        )}
      </div>
      <ul className="ocr-legend font-mono" aria-label="Confidence legend">
        <li className="ocr-legend__item">
          <span className="ocr-legend__swatch" style={{ background: CONFIDENCE_COLORS.high }} />
          High OCR conf.
        </li>
        <li className="ocr-legend__item">
          <span className="ocr-legend__swatch" style={{ background: CONFIDENCE_COLORS.medium }} />
          Medium
        </li>
        <li className="ocr-legend__item">
          <span
            className="ocr-legend__swatch ocr-legend__swatch--dashed"
            style={{ borderColor: CONFIDENCE_COLORS.low }}
          />
          Low / uncertain
        </li>
      </ul>
    </div>
  );
}
