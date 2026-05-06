// ─── Add this to your next.config.js (or next.config.ts) ────────────────────
// Allows next/image AND CSS background-image to load from images.unsplash.com
//
// If you already have a next.config.js, merge the `images` block into it.

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
