import type { NextConfig } from "next";

// cacheComponents stays off: pages call getServerSession()/requireUser() at the top,
// which Cache Components only allows inside <Suspense>.
const nextConfig: NextConfig = {
  // facility photos go through a server action; default limit is 1 MB, the form allows 4 MB
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
