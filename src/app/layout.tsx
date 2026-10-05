import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Geist_Mono,
  Noto_Sans_Gujarati,
  Noto_Serif_Devanagari,
  Noto_Serif_Gujarati,
  Nunito,
} from "next/font/google";
import { event } from "@/lib/event";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const devanagari = Noto_Serif_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500"],
});

// Gujarati letters fall back to these when the Latin fonts have no glyph for them.
// They are only downloaded when a guest actually switches to Gujarati.
const gujaratiSerif = Noto_Serif_Gujarati({
  variable: "--font-gujarati-serif",
  subsets: ["gujarati"],
  weight: ["400", "500", "600"],
  preload: false,
});

const gujaratiSans = Noto_Sans_Gujarati({
  variable: "--font-gujarati-sans",
  subsets: ["gujarati"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = `${event.brand} | Shrimant Sanskar & ${event.title} RSVP`;
const description =
  "Join us for Nidhi & Hardik’s Shrimant Sanskar and baby shower celebration on October 25, 2026 in Paramus, NJ. View details and RSVP.";

export const metadata: Metadata = {
  metadataBase: new URL(event.siteUrl),
  title,
  description,
  applicationName: `${event.brand} ${event.title}`,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: `${event.brand} ${event.title}`,
    title,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#f3f6f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${nunito.variable} ${geistMono.variable} ${devanagari.variable} ${gujaratiSerif.variable} ${gujaratiSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
