import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  outputFileTracingExcludes: {
    "*": [".env.local", ".env*", "data/**", "data/rsvps.json"],
  },
};

export default nextConfig;
