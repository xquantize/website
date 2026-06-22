"use client";

import { useEffect, useState } from "react";
import { NAV, SITE } from "@/lib/content";

function sectionHash(href: string) {
  const hash = href.split("#")[1];
  return hash ? `#${hash}` : href;
}

export function SiteNav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const sections = NAV.map((item) => document.querySelector(sectionHash(item.href))).filter(
      Boolean,
    );

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActive(`#${visible.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section!));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="site-nav" aria-label="Main">
      <a href="/" className="site-nav__brand pointer-events-auto">
        {SITE.name.split(" ")[0]}
      </a>
      <ul className="site-nav__links">
        {NAV.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={active === sectionHash(item.href) ? "is-active" : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
