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

export default function Header() {
  const { md, sm } = useMediaQuery()
  const imageSize = md ? 90 : sm ? 70 : 50
  const { theme } = useTheme()

  return (
    <header>
      <div className="container-fluid flex justify-between items-center py-6 mx-4">
        <Link href="/" className="flex items-center gap-2 sm:gap-4">
          <Image
            src={
              theme === "dark"
                ? "/daily-scoop-thumb-dark.webp"
                : "/daily-scoop-thumb-light.webp"
            }
            alt="Daily Scoop AI Logo"
            width={imageSize}
            height={imageSize}
          />
          <div className="flex flex-col">
            <TypographyH4
              className={md ? "text-xl" : sm ? "text-md" : "text-[8px]"}
            >
              Breaking News Without Bias
            </TypographyH4>
            <TypographyLead
              className={
                md ? "text-xs text-inherit" : sm ? "text-[10px]" : "text-[8px]"
              }
            >
              Powered By AI
            </TypographyLead>
          </div>
        </Link>

        <nav
          className={md ? "flex items-center gap-6" : "flex items-center gap-4"}
        >
          <ModeToggle
            className={md ? "h-9 w-9" : sm ? "h-8 w-8" : "h-7 w-7"}
            iconClassName={md ? "h-5 w-5" : sm ? "h-4 w-4" : "h-3 w-3"}
          />
          <Link
            href="/about"
            className={
              md
                ? "text-foreground/80 hover:text-foreground transition-colors"
                : "text-sm text-foreground/80 hover:text-foreground transition-colors"
            }
          >
            About
          </Link>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/newsletter"
                  onClick={(e) => e.preventDefault()}
                  className={cn(
                    md
                      ? "text-foreground/40 cursor-not-allowed"
                      : "text-sm text-foreground/40 cursor-not-allowed",
                    "transition-colors"
                  )}
                  aria-disabled="true"
                >
                  Newsletter
                </Link>
              </TooltipTrigger>
              <TooltipContent className="mr-2">
                <p className={md ? "text-sm" : "text-[10px]"}>
                  Feature coming soon
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </div>
      <Separator className="opacity-75" />
    </header>
  )
}
