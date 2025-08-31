/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "marimexbackend.vercel.app" },
      { protocol: "https", hostname: "i.postimg.cc" },
    ],
  },
  experimental: {
    // Allow LAN device to access dev server assets
    allowedDevOrigins: ["http://localhost:4200", "http://192.168.100.116:4200"],
  },
  turbopack: {
    // Point Turbopack to the correct workspace root
    root: __dirname,
  },
  eslint: {
    // Don’t block production builds on ESLint errors
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
