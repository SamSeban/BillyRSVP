import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Set the base path for GitHub Pages (repository name)
  basePath: '/BillyRSVP',
  assetPrefix: '/BillyRSVP/',
};

export default nextConfig;
