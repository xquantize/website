import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SITE } from "@/lib/content";

export function AboutSection() {
  return (
    <section id="about" className="content-section">
      <ScrollReveal className="max-w-2xl">
        <div className="section-divider" />
        <p className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-40 mb-6">
          About
        </p>
        <h2
          className="font-serif italic font-light tracking-tight leading-[1.1] mb-8"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
        >
          Autonomy, perception,
          <br />
          and applied research.
        </h2>
        <div className="space-y-4 text-sm opacity-55 leading-relaxed max-w-lg">
          {SITE.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-10">
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="site-link font-mono text-[0.7rem] tracking-[0.15em] uppercase pointer-events-auto"
          >
            GitHub
          </a>
          <a
            href={SITE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="site-link font-mono text-[0.7rem] tracking-[0.15em] uppercase pointer-events-auto"
          >
            LinkedIn
          </a>
          <a
            href={SITE.orcid}
            target="_blank"
            rel="noopener noreferrer"
            className="site-link font-mono text-[0.7rem] tracking-[0.15em] uppercase pointer-events-auto"
          >
            ORCID
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
}
