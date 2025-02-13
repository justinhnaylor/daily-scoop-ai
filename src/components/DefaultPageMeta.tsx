import { Metadata } from "next"

export const defaultMetadata: Metadata = {
  title: {
    default: "Daily Scoop AI - AI-Powered News",
    template: "%s | Daily Scoop AI",
  },
  description:
    "Get real-time news updates and in-depth analysis powered by artificial intelligence.",
  applicationName: "Daily Scoop AI",
  authors: [{ name: "Daily Bot" }],
  generator: "Next.js",
  keywords: [
    "AI news",
    "artificial intelligence",
    "news analysis",
    "real-time news",
  ],
  referrer: "origin-when-cross-origin",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}
