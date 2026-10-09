import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the guest form say whether a confirmation email will follow (needs a verified sender).
  env: {
    NEXT_PUBLIC_GUEST_CONFIRMATIONS: process.env.RESEND_API_KEY?.trim() && process.env.NOTIFY_FROM_EMAIL?.trim() ? "on" : "off",
  },
  allowedDevOrigins: ["127.0.0.1", "*.trycloudflare.com"],
  outputFileTracingExcludes: {
    "*": [".env.local", ".env*", "data/**", "data/rsvps.json"],
  },
};

export default nextConfig;
