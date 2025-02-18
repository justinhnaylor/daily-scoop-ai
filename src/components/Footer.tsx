"use client"

import Link from "next/link"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Footer() {
  const { md, sm } = useMediaQuery()

  return (
    <footer className="border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3
              className={cn(
                "font-bold mb-4",
                md ? "text-lg" : sm ? "text-base" : "text-sm"
              )}
            >
              About Us
            </h3>
            <p
              className={cn(
                "text-foreground/70",
                md ? "text-base" : sm ? "text-sm" : "text-xs"
              )}
            >
              Daily Scoop AI delivers accurate, unbiased news through AI-powered
              articles, images, and audio, focusing on transparent journalism
              and innovative technology.
            </p>
          </div>

          <div>
            <h3
              className={cn(
                "font-bold mb-4",
                md ? "text-lg" : sm ? "text-base" : "text-sm"
              )}
            >
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className={cn(
                    "text-foreground/70 hover:text-foreground transition-colors",
                    md ? "text-base" : sm ? "text-sm" : "text-xs"
                  )}
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3
              className={cn(
                "font-bold mb-4",
                md ? "text-lg" : sm ? "text-base" : "text-sm"
              )}
            >
              Connect With Us
            </h3>
            <p
              className={cn(
                "text-foreground/70",
                md ? "text-base" : sm ? "text-sm" : "text-xs"
              )}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        "cursor-not-allowed opacity-70",
                        md ? "text-base" : sm ? "text-sm" : "text-xs"
                      )}
                    >
                      Sign up
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Feature coming soon</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>{" "}
              for our newsletter to receive daily news updates and analysis.
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-foreground/70">
          <p className={cn(md ? "text-base" : sm ? "text-sm" : "text-xs")}>
            &copy; {new Date().getFullYear()} Daily Scoop AI. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
