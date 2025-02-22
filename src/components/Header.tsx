"use client"

import Image from "next/image"
import Link from "next/link"
import { ModeToggle } from "./modeToggle"
import { Separator } from "./ui/separator"
import { TypographyH4, TypographyLead } from "./ui/typography"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Skeleton } from "./ui/skeleton"

export default function Header() {
  const { md, sm } = useMediaQuery()
  const imageSize = md ? 80 : sm ? 60 : 45
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get initial theme state before mounting
  const isDark =
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false

  const imageSrc = mounted
    ? resolvedTheme === "dark"
      ? "/daily-scoop-thumb-dark.webp"
      : "/daily-scoop-thumb-light.webp"
    : isDark
    ? "/daily-scoop-thumb-dark.webp"
    : "/daily-scoop-thumb-light.webp"

  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-fluid flex justify-between items-center py-3 px-4 md:py-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 md:gap-4 transition-transform hover:scale-[0.99]"
        >
          {!mounted ? (
            <Skeleton
              className="rounded-md"
              style={{ width: imageSize, height: imageSize }}
            />
          ) : (
            <Image
              src={imageSrc}
              alt="Daily Scoop AI Logo"
              width={imageSize}
              height={imageSize}
              className="rounded-md"
            />
          )}
          <div className="flex flex-col">
            <TypographyH4
              className={cn(
                "tracking-tight transition-colors",
                md ? "text-lg" : sm ? "text-base" : "text-sm"
              )}
            >
              Breaking News Without Bias
            </TypographyH4>
            <TypographyLead
              className={cn(
                "tracking-tight text-muted-foreground",
                md ? "text-sm" : sm ? "text-xs" : "text-[10px]"
              )}
            >
              Powered By AI
            </TypographyLead>
          </div>
        </Link>

        <nav className="flex items-center gap-3 md:gap-6">
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div>
                  <ModeToggle
                    className={cn(
                      "transition-colors hover:bg-muted",
                      md ? "h-9 w-9" : sm ? "h-8 w-8" : "h-7 w-7"
                    )}
                    iconClassName={md ? "h-5 w-5" : sm ? "h-4 w-4" : "h-3 w-3"}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {[
            { href: "/about", label: "About" },
            { href: "/newsletter", label: "Newsletter" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                md ? "text-base" : "text-sm"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <Separator className="opacity-40" />
    </header>
  )
}
