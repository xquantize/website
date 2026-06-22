import { notFound } from "next/navigation";
import { getProjectBySlug, PROJECTS } from "@/lib/content";
import { renderOgImage } from "@/lib/og-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return renderOgImage({
    label: `${project.id} · ${project.status}`,
    headline: project.hook,
    subtitle: project.title,
    footer: project.tags.join(" · "),
    accentColor: project.accent,
  });
}
