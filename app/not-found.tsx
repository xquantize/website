import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { PROJECTS, SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  const demo = PROJECTS.find((p) => p.kind === "playground");

  return (
    <SiteShell scene="static">
      <main className="not-found page-enter">
        <p className="not-found__code font-mono">404</p>
        <h1 className="not-found__title font-serif italic font-light tracking-tight">
          Page not found.
        </h1>
        <p className="not-found__text">
          That route doesn&apos;t exist — but the autograd demo does.
        </p>
        <div className="not-found__actions">
          <Link href="/" className="not-found__link font-mono pointer-events-auto">
            ← Home
          </Link>
          {demo && (
            <Link
              href={`/work/${demo.slug}`}
              className="not-found__link not-found__link--accent font-mono pointer-events-auto"
            >
              Try the demo →
            </Link>
          )}
        </div>
        <p className="not-found__hint font-mono">{SITE.name}</p>
      </main>
    </SiteShell>
  );
}
