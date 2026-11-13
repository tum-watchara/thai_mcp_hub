import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  // Cache Components is intentionally off for the mock phase: every data view is
  // client-rendered through TanStack Query, and next-intl reads the request locale.
  // Re-enable (with partialPrefetching) once real server data fetching lands.
  cacheComponents: false,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["@repo/ui", "@repo/schemas", "@repo/mocks"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
  },
});

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(withMDX(nextConfig));
