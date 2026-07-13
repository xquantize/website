"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/motion-preference";
import type { OcrSample } from "@/lib/ocr/samples";
import { runOcr } from "@/lib/ocr/run-ocr";
import type { OcrResult } from "@/lib/ocr/types";
import { DocumentOverlay } from "./document-overlay";
import { ProcessingStatus } from "./processing-status";
import { TextPanel } from "./text-panel";
import { UploadZone } from "./upload-zone";

type Phase = "idle" | "loading-image" | "ocr" | "done" | "error";

type Props = {
  accent?: string;
};

async function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = src;
  });
}

export function DocumentOcr({ accent = "#e8b86d" }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [ocr, setOcr] = useState<OcrResult | null>(null);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl?.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const processSource = useCallback(async (src: string, label: string) => {
    setError(null);
    setOcr(null);
    setActiveLineId(null);
    setPhase("loading-image");
    setProgress(0);
    setStatus("");
    setSourceLabel(label);

    try {
      const img = await loadImageElement(src);

      // Keep the original photo for the overlay — preprocessing is OCR-only.
      setImageUrl((prev) => {
        if (prev?.startsWith("blob:") && prev !== src) URL.revokeObjectURL(prev);
        return src;
      });

      setPhase("ocr");
      const result = await runOcr(img, ({ status: s, progress: p }) => {
        setStatus(s);
        setProgress(p);
      });

      setOcr(result);
      setProgress(1);
      setPhase("done");

      if (!result.lines.length) {
        setError("No text detected. Try a sharper, well-lit image.");
      }
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "OCR failed on this image.");
      setOcr(null);
    }
  }, []);

  const onFile = useCallback(
    async (file: File, label?: string) => {
      const url = URL.createObjectURL(file);
      await processSource(url, label ?? file.name);
    },
    [processSource],
  );

  const onSample = useCallback(
    async (sample: OcrSample) => {
      await processSource(sample.src, sample.label);
    },
    [processSource],
  );

  const busy = phase === "loading-image" || phase === "ocr";

  return (
    <div className="ocr-lab" style={{ "--project-accent": accent } as React.CSSProperties}>
      <UploadZone disabled={busy} onFile={onFile} onSample={onSample} />

      <ProcessingStatus
        phase={phase}
        progress={progress}
        status={status}
        reducedMotion={reducedMotion}
      />

      {error ? (
        <p className="ocr-error font-mono" role="alert">
          {error}
        </p>
      ) : null}

      <div className="ocr-lab__layout">
        <div className="ocr-lab__stage">
          <DocumentOverlay
            imageUrl={imageUrl}
            ocr={ocr}
            activeLineId={activeLineId}
            onSelectLine={setActiveLineId}
          />
        </div>
        <TextPanel
          ocr={ocr}
          sourceLabel={sourceLabel}
          activeLineId={activeLineId}
          onSelectLine={setActiveLineId}
        />
      </div>
    </div>
  );
}

/** @deprecated Use DocumentOcr — kept as alias for dynamic import stability during rename. */
export const ReceiptOcr = DocumentOcr;
