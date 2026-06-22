import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { ProjectPageContent } from "@/components/work/project-page-content";
import { getProjectBySlug, PROJECTS } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Not found" };

  const title = project.title;
  const description = project.description;
  const path = `/work/${project.slug}`;

  return {
    title,
    description,
    openGraph: {
      title: `${project.hook} · ${project.title}`,
      description,
      type: "website",
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.hook} · ${project.title}`,
      description,
    },
  };
}

export default async function WorkProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <SiteShell scene="static">
      <ProjectPageContent project={project} />
    </SiteShell>
  );
}
