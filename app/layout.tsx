import type { Metadata } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { AppChrome } from "@/components/providers/app-chrome";
import { SITE } from "@/lib/content";
import { getSiteUrl } from "@/lib/site-url";

const title = `${SITE.name} — ${SITE.title}`;
const description =
  "ML and autonomy specialist. Perception systems, LLMs, and multi-domain UXV autonomy stacks. Open to contracting.";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
        <AppChrome />
      </body>
    </html>
  );
}
