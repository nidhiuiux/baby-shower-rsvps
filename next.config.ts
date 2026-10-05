import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "*.trycloudflare.com"],
  outputFileTracingExcludes: {
    "*": [".env.local", ".env*", "data/**", "data/rsvps.json"],
  },
};

export default nextConfig;
