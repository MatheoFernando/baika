import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  experimental: {
  optimizePackageImports: ['package-name'],
},
};

export default nextConfig;
