import { SITE } from "@/lib/content";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <p className="site-footer__copy font-mono">
        © {year} {SITE.name}
      </p>
      <div className="site-footer__links">
        <a
          href={SITE.github}
          target="_blank"
          rel="noopener noreferrer"
          className="site-footer__link font-mono pointer-events-auto"
        >
          GitHub
        </a>
        <a
          href={SITE.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="site-footer__link font-mono pointer-events-auto"
        >
          LinkedIn
        </a>
      </div>
    </footer>
  );
}
