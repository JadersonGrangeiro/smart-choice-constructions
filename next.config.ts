import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  // Images: unoptimized required for static export
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
  },

  // TypeScript — strict, errors fail the build
  typescript: { ignoreBuildErrors: false },

  // Production optimisations
  compiler: {
    // Remove all console.* calls in production builds
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error"] }  // keep console.error for production monitoring
      : false,
  },

  // Compress static assets
  compress: true,

  // React strict mode catches bugs early
  reactStrictMode: true,

  // Security: hide the X-Powered-By header
  poweredByHeader: false,

  // Experimental: faster builds
  experimental: {
    // Turbopack is used in dev; standard webpack in production build
  },
};

export default nextConfig;
