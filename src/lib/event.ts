/**
 * Edit this file to personalize your baby shower invitation.
 * Share the home page link as your RSVP link.
 */
export const event = {
  /** Small line above the names */
  eyebrow: "Parents-to-be",
  /** Shown large on the page — usually the parents' names */
  brand: "Nidhi & Hardik",
  title: "Baby Shower",
  tagline: "We'd love to celebrate with you. Please let us know if you can make it.",
  date: "Sunday, October 25 · 10:30 AM",
  /** ISO start used by the countdown and calendar file */
  startsAt: "2026-10-25T10:30:00-04:00",
  /** ISO end used by the calendar file (about three hours) */
  endsAt: "2026-10-25T13:30:00-04:00",
  location: "124 Crain Road, Paramus, NJ 07652",
  /**
   * Live-stream link for guests who can't attend in person.
   * Leave empty until you have it — the page shows "stay tuned" instead.
   */
  liveStreamUrl: "",
  /** Simple PIN to view RSVP responses at /host */
  hostPin: "shower",
  /** Email that receives a notification for every RSVP */
  notifyEmail: "nsavaliya93@gmail.com",
  /** Opening blessing, shown with Kabir Saheb */
  blessing: {
    eyebrow: "With Saheb's blessings",
    title: "साहेब बंदगी साहेब",
    /** Latin spelling shown beneath the Hindi greeting */
    transliteration: "Saheb Bandagi Saheb",
    message: "With hearts full of gratitude, we warmly welcome you to share in our joy.",
  },
  /** The ceremony itself, shown with the mother-to-be */
  shrimant: {
    eyebrow: "A blessing for the little one",
    title: "Shrimant Sanskar",
    line: "A little one is on the way",
    message:
      "Join us for a gentle gathering of prayers, blessings and love as we welcome our baby. Your presence means the world to us.",
  },
} as const;
