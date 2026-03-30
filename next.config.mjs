import { withSentryConfig } from "@sentry/nextjs";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\/api\/weddings\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-weddings",
        expiration: { maxAgeSeconds: 300 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /^https?:\/\/.*\/casamento\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "casamento-pages",
        expiration: { maxAgeSeconds: 3600 },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
  },
  compress: true,
};

export default withSentryConfig(withPWA(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
