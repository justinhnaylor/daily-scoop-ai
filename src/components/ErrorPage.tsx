"use client"

import { Button } from "@/components/ui/button"
import { TypographyH1, TypographyP } from "@/components/ui/typography"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface ErrorPageProps {
  code: "404" | "500"
  message: string
}

export default function ErrorPage({ code, message }: ErrorPageProps) {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-36 md:w-72 xl:ml-32">
          <Image
            src="/error_dorothy.svg"
            alt="Error illustration"
            width={200}
            height={200}
            className="w-full h-auto max-w-lg mx-auto"
            priority
          />
        </div>

        <div className="w-full md:w-1/2 text-center md:text-left">
          <div className="space-y-4">
            <TypographyH1 className="text-4xl md:text-6xl font-bold">
              Toto, we&apos;re not in Kansas anymore
            </TypographyH1>

            <div className="space-y-4">
              <div className="md:text-8xl text-6xl font-bold text-primary/20">
                {code}
              </div>
              <TypographyP className="text-xl text-foreground/60">
                {message}
              </TypographyP>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button onClick={() => router.push("/")}>Return Home</Button>
              {code === "500" && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
