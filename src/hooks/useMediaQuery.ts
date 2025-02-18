"use client"

import { useEffect, useState } from "react"

// Define breakpoint values
export const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const

type Breakpoint = keyof typeof breakpoints

// Create a hook that returns an object with boolean values for each breakpoint
export function useMediaQuery(): Record<Breakpoint, boolean> {
  const [matches, setMatches] = useState<Record<Breakpoint, boolean>>({
    sm: false,
    md: false,
    lg: false,
    xl: false,
    "2xl": false,
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const queries = Object.entries(breakpoints).map(([key, query]) => ({
      key: key as Breakpoint,
      mediaQuery: window.matchMedia(query),
    }))

    // Set initial values
    setMatches((prev) => ({
      ...prev,
      ...Object.fromEntries(
        queries.map(({ key, mediaQuery }) => [key, mediaQuery.matches])
      ),
    }))

    // Add listeners
    const handlers = queries.map(({ key, mediaQuery }) => {
      const handler = (event: MediaQueryListEvent) => {
        setMatches((prev) => ({ ...prev, [key]: event.matches }))
      }
      mediaQuery.addEventListener("change", handler)
      return { mediaQuery, handler }
    })

    // Cleanup
    return () => {
      handlers.forEach(({ mediaQuery, handler }) => {
        mediaQuery.removeEventListener("change", handler)
      })
    }
  }, [])

  return matches
}
