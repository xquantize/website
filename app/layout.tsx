import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { AppChrome } from "@/components/providers/app-chrome";
import { SkipLink } from "@/components/ui/skip-link";
import { fontVariables } from "@/lib/fonts";
import { SITE } from "@/lib/content";
import { getSiteUrl } from "@/lib/site-url";

const title = `${SITE.name} — ${SITE.title}`;
const description =
  "Applied ML and AI engineer. Computer vision, LLMs, OCR, and production ML systems. Open to contracting.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: title,
    template: `%s — ${SITE.name}`,
  },
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_GB",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVariables}>
      <body className={fontVariables}>
        <SkipLink />
        <SmoothScroll>{children}</SmoothScroll>
        <AppChrome />
      </body>
    </html>
  );
}
