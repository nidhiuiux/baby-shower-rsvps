import type { MetadataRoute } from "next";
import { event } from "@/lib/event";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${event.brand} ${event.title}`,
    short_name: "Baby Shower",
    description: "Details and RSVP for Nidhi & Hardik’s Shrimant Sanskar and baby shower.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f6f2",
    theme_color: "#f3f6f2",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
