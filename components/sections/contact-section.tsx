import { ReadingPool } from "@/components/ui/reading-pool";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SITE } from "@/lib/content";

export function ContactSection() {
  return (
    <section id="contact" className="content-section">
      <ReadingPool className="max-w-3xl">
        <ScrollReveal mode="scrub">
          <div className="section-divider" />
          <p className="section-kicker font-mono text-[0.7rem] tracking-[0.15em] uppercase">
            Contact
          </p>
          <h2 className="section-title font-serif italic font-light tracking-tight">
            Let&apos;s talk.
          </h2>
          <p className="home-prose max-w-md mb-8">
            {SITE.availability}. Reach out by email or on LinkedIn.
          </p>
          <div className="flex flex-col gap-3 pointer-events-auto">
            <a href={`mailto:${SITE.email}`} className="site-link text-[0.9375rem]">
              {SITE.email}
            </a>
            <a
              href={SITE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="site-link font-mono text-[0.7rem] tracking-[0.15em] uppercase"
            >
              LinkedIn
            </a>
          </div>
        </ScrollReveal>
      </ReadingPool>
    </section>
  );
}
