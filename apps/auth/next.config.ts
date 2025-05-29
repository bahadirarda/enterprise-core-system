import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Skip build-time static generation to avoid environment variable issues
  trailingSlash: false,
  // Disable static optimization to prevent build-time execution
  poweredByHeader: false,
};

export default nextConfig;
