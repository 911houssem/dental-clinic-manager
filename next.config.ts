import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Netlify plugin handles output
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
