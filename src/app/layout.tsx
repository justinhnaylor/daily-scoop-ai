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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Daily Scoop AI",
  description: "News And Analysis",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
        className={`${geistSans.variable} ${geistMono.variable} ${customFont.variable} antialiased min-h-screen flex flex-col`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
          <Analytics />
          <SpeedInsights />
        </QueryProvider>
      </body>
    </html>
  )
}
