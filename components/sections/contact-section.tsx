import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SITE } from "@/lib/content";

export function ContactSection() {
  return (
    <section id="contact" className="content-section">
      <ScrollReveal className="max-w-2xl">
        <div className="section-divider" />
        <p className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-40 mb-6">
          Contact
        </p>
        <h2
          className="font-serif italic font-light tracking-tight leading-[1.1] mb-8"
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
        >
          Let&apos;s talk.
        </h2>
        <p className="text-sm opacity-50 leading-relaxed max-w-md mb-10">
          {SITE.availability}. Reach out by email or on LinkedIn — happy to talk
          about contracting, research, or autonomy work.
        </p>
        <div className="flex flex-col gap-4">
          <a
            href={`mailto:${SITE.email}`}
            className="site-link text-sm pointer-events-auto"
          >
            {SITE.email}
          </a>
          <a
            href={SITE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="site-link font-mono text-[0.7rem] tracking-[0.15em] uppercase pointer-events-auto"
          >
            Message on LinkedIn
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
}
