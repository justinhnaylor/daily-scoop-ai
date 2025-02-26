"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import { navigationEvents } from "@/lib/navigationEvents"

export default function NavigationProgress() {
  const pathname = usePathname()

  useEffect(() => {
    // Configure NProgress
    NProgress.configure({
      showSpinner: false,
      minimum: 0.1, // Show progress bar after 10% progress (makes it appear faster)
      trickleSpeed: 100, // Speed up the trickling effect
      easing: "ease",
      speed: 400,
    })

    // Handle navigation events
    const startNavigation = () => {
      NProgress.start()
    }

    const completeNavigation = () => {
      NProgress.done()
    }

    // Subscribe to navigation events
    const unsubscribeStart = navigationEvents.on("start", startNavigation)
    const unsubscribeDone = navigationEvents.on("done", completeNavigation)

    // Add event listener for page unload
    window.addEventListener("beforeunload", startNavigation)

    // Clean up on component unmount
    return () => {
      unsubscribeStart()
      unsubscribeDone()
      window.removeEventListener("beforeunload", startNavigation)
      NProgress.done()
    }
  }, [])

  // Track route changes to complete navigation
  useEffect(() => {
    // When pathname changes, navigation is complete
    navigationEvents.done()
  }, [pathname])

  return null
}
