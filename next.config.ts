import type { NextConfig } from "next";

const svcUrl = process.env.SOUS_SVC_URL ?? "http://127.0.0.1:5001";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "img.spoonacular.com" }],
  },
  // proxy browser calls to sous-svc so there's no cors and the svc url stays private
  async rewrites() {
    return [{ source: "/api/svc/:path*", destination: `${svcUrl}/:path*` }];
  },
};

export default nextConfig;
