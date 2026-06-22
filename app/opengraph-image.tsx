import { renderOgImage } from "@/lib/og-image";
import { SITE } from "@/lib/content";

export const alt = `${SITE.name} — ${SITE.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage({
    label: SITE.name,
    headline: "building ",
    accent: "intelligent systems.",
    subtitle: SITE.title,
  });
}
