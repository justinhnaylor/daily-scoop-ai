import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import QueryProvider from "@/providers/QueryProvider"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { ThemeProvider } from "@/components/theme-provider"
import { customFont } from "@/lib/fonts"
import { Toaster } from "@/components/ui/toaster"
import NewsletterToast from "@/components/NewsletterToast"
import { cn } from "@/lib/utils"
import RevalidationListener from "@/components/home/RevalidationListener"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// Helper function to ensure URL has protocol
function getValidBaseUrl(url: string): string {
  if (!url) return "http://localhost:3000"
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return `https://${url}`
}

const baseUrl = getValidBaseUrl(process.env.NEXT_PUBLIC_BASE_URL || "")

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "The Daily Scoop",
    template: "%s | The Daily Scoop",
  },
  description: "Your trusted source for daily news and updates",
  openGraph: {
    title: "Daily Scoop AI - Breaking News Without Bias",
    description:
      "Stay ahead with AI-powered news that cuts through the noise. Get unbiased, fact-driven stories tailored just for you.",
    url: baseUrl,
    siteName: "Daily Scoop AI",
    images: [
      {
        url: "https://dymrplcuovidgyepquba.supabase.co/storage/v1/object/public/images//og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Daily Scoop AI - Breaking News Without Bias",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Scoop AI - Breaking News Without Bias",
    description:
      "Stay ahead with AI-powered news that cuts through the noise. Get unbiased, fact-driven stories tailored just for you.",
    images: [
      "https://dymrplcuovidgyepquba.supabase.co/storage/v1/object/public/images//og-image.jpg",
    ],
    creator: "@dailyscoopai",
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script>{`
          (function() {
            try {
              const storedTheme = localStorage.getItem('theme')
              if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
              }
            } catch (e) {
              console.error('Theme initialization failed:', e)
            }
          })()
        `}</script>
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/web-app-manifest-96x96.png"
        />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <meta name="apple-mobile-web-app-title" content="Daily Scoop AI" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
          customFont.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <RevalidationListener>
              <Header />
              {children}
              <Footer />
              <Toaster />
              <NewsletterToast />
            </RevalidationListener>
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
