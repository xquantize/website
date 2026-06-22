import { SiteNav } from "@/components/ui/site-nav";
import { SiteBackground } from "@/components/layout/site-background";

type Props = {
  children: React.ReactNode;
  scrollAtmosphere?: boolean;
  scene?: "full" | "static";
};

export function SiteShell({
  children,
  scrollAtmosphere = false,
  scene = "full",
}: Props) {
  return (
    <>
      <SiteNav />
      <SiteBackground scrollAtmosphere={scrollAtmosphere} scene={scene} />
      <div className={`scroll-content${scene === "static" ? " scroll-content--page" : ""}`}>
        {children}
      </div>
    </>
  );
}
