import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ProjectExplorer } from "@/components/sections/project-explorer";

export function WorkSection() {
  return (
    <section id="work" className="content-section content-section--work">
      <div className="max-w-5xl w-full">
        <ScrollReveal>
          <div className="section-divider" />
          <p className="font-mono text-[0.7rem] tracking-[0.15em] uppercase opacity-40 mb-6">
            Selected Work
          </p>
          <h2
            className="font-serif italic font-light tracking-tight leading-[1.1] mb-12 max-w-lg"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Projects &amp; case studies.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <ProjectExplorer />
        </ScrollReveal>
      </div>
    </section>
  );
}
