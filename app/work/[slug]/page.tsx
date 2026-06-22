import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { ProjectPageContent } from "@/components/work/project-page-content";
import { getProjectBySlug, PROJECTS, SITE } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Not found" };

  return {
    title: `${project.title} — ${SITE.name}`,
    description: project.description,
  };
}

export default async function WorkProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <SiteShell>
      <ProjectPageContent project={project} />
    </SiteShell>
  );
}
