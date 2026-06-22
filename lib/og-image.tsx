import { ImageResponse } from "next/og";
import { SITE } from "@/lib/content";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

type OgImageOptions = {
  label: string;
  headline: string;
  accent?: string;
  subtitle: string;
  footer?: string;
  accentColor?: string;
};

export function renderOgImage({
  label,
  headline,
  accent,
  subtitle,
  footer = SITE.availability,
  accentColor = SITE.accent,
}: OgImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(160deg, #0c2a3a 0%, #081420 55%, #050c14 100%)",
          color: "#f5f0e8",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.45,
            fontFamily: "monospace",
          }}
        >
          {label}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 64,
              fontStyle: "italic",
              fontWeight: 300,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              fontFamily: "Georgia, serif",
              maxWidth: 900,
            }}
          >
            {headline}
            {accent ? <span style={{ color: accentColor }}>{accent}</span> : null}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              opacity: 0.55,
              fontFamily: "monospace",
              letterSpacing: "0.06em",
              lineHeight: 1.4,
              maxWidth: 820,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 20,
            opacity: 0.35,
            fontFamily: "monospace",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {footer}
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
