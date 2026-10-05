import { MusicVideoPinStack, type MusicVideoPinStackItem } from "@/components/ui/music-video-pin-stack";
import { event } from "@/lib/event";

const liveUrl = event.liveStreamUrl || undefined;
const when = "Sunday, Oct 25 · 10:30 AM";

const items: MusicVideoPinStackItem[] = [
  {
    id: "stay-tuned",
    title: "Stay tuned",
    label: liveUrl ? "Join the live stream" : "Live stream link coming soon",
    released: when,
    imageSrc: "/art/krishna-flute.webp",
    tint: "#f6ecea",
    href: liveUrl,
    badge: liveUrl ? "Watch live" : "Link coming soon",
  },
  {
    id: "from-afar",
    title: "Celebrate with us from anywhere",
    label: "We will share the link right here",
    released: "Check back closer to the day",
    imageSrc: "/art/radha.webp",
    tint: "#e4efe6",
    href: liveUrl,
  },
  {
    id: "blessings",
    title: "Blessings, near and far",
    label: "साहेब बंदगी साहेब",
    released: "With love, Nidhi & Hardik",
    imageSrc: "/art/kabir.webp",
    tint: "#f3e7e5",
    href: liveUrl,
  },
];

/** Full-width pinned section; guests who cannot attend are told a live link is on its way */
export function LiveStream() {
  return <MusicVideoPinStack heading="LIVE STREAM" items={items} className="relative z-10 mt-14 sm:mt-20" />;
}
