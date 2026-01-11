import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({ // eslint-disable-line @typescript-eslint/no-require-imports
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Handle dynamic routes for static export
  generateBuildId: () => 'build',
};

export default withPWA(nextConfig);
