"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { TypographyH3, TypographyP } from "@/components/ui/typography"
import { Button } from "./ui/button"
import { Mail } from "lucide-react"

export default function NewsletterToast() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const permanentlyDismissed = localStorage.getItem(
      "newsletterToastDismissed"
    )

    const shownThisSession = sessionStorage.getItem("newsletterToastShown")

    if (permanentlyDismissed === "true" || shownThisSession === "true") return

    const timer = setTimeout(() => {
      sessionStorage.setItem("newsletterToastShown", "true")

      const { dismiss } = toast({
        duration: 100000,
        className: "newsletter-toast",
        description: (
          <div className="relative">
            <div className="pt-1">
              <TypographyH3 className="mb-2 text-base text-center sm:text-left sm:text-xl md:text-base lg:text-lg">
                <span className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  Want News Delivered Right to Your Inbox?
                  <Mail className="h-5 w-5" />
                </span>
              </TypographyH3>
              <TypographyP className="text-sm text-center sm:text-left sm:text-base lg:text-base text-muted-foreground mb-1">
                It&apos;s free and will change your life forever (probably).{" "}
                <Link
                  href="/newsletter"
                  className="font-bold text-blue-500 text-sm hover:text-blue-700 hover:underline"
                  onClick={() => dismiss()}
                >
                  Sign up
                </Link>
              </TypographyP>
            </div>
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.setItem("newsletterToastDismissed", "true")
                  dismiss()
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Don&apos;t show again
              </Button>
            </div>
          </div>
        ),
      })
    }, 5000)

    return () => clearTimeout(timer)
  }, [toast, mounted])

  return null
}
