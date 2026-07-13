"use client";

import { useId, useRef, useState } from "react";
import { OCR_SAMPLES, type OcrSample } from "@/lib/ocr/samples";

type Props = {
  disabled?: boolean;
  onFile: (file: File, label?: string) => void;
  onSample: (sample: OcrSample) => void;
};

export function UploadZone({ disabled, onFile, onSample }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    onFile(file, file.name);
  };

  return (
    <div className="ocr-toolbar">
      <div
        className={`ocr-toolbar__drop${dragging ? " is-dragging" : ""}${disabled ? " is-disabled" : ""}`}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="ocr-toolbar__copy">
          <p className="ocr-toolbar__title font-mono">Image → text</p>
          <p className="ocr-toolbar__hint">Drop an image, or pick a sample. OCR runs in-browser.</p>
        </div>
        <label className="lab-btn lab-btn--primary ocr-toolbar__browse" htmlFor={inputId}>
          Choose file
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="ocr-upload__input"
          disabled={disabled}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div className="ocr-toolbar__samples" role="group" aria-label="Sample images">
        {OCR_SAMPLES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className="lab-option font-mono"
            disabled={disabled}
            title={sample.description}
            onClick={() => onSample(sample)}
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
}
