import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake heavy barrel imports when modules resolve through them.
    optimizePackageImports: ["three", "gsap"],
  },
  async headers() {
    return [
      {
        // Public demo assets (OCR samples, etc.) — long-lived, content-hashed by filename when updated.
        source: "/work/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
