"use client";

import { useEffect, useState } from "react";
import { NAV, SITE } from "@/lib/content";

export function SiteNav() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const sections = NAV.map((item) => document.querySelector(item.href)).filter(Boolean);

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
      <a href="#" className="site-nav__brand">
        {SITE.name.split(" ")[0]}
      </a>
      <ul className="site-nav__links">
        {NAV.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={active === item.href ? "is-active" : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
