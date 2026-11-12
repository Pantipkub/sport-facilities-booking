import type { NextConfig } from "next";

// cacheComponents stays off: pages call getServerSession()/requireUser() at the top,
// which Cache Components only allows inside <Suspense>.
const nextConfig: NextConfig = {
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
