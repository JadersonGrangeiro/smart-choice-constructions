import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSR mode — required for API routes, auth, and Stripe webhooks
  // output: "export" was removed to enable server-side features

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Supabase Storage
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // External contractor photos
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  typescript: { ignoreBuildErrors: false },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },

  compress: true,
  reactStrictMode: true,
  poweredByHeader: false,

  // Required for Stripe webhook raw body parsing
  async headers() {
    return [
      {
        source: "/api/stripe/webhook",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
};

export default nextConfig;
