"use client"

import { ShareIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"

type ShareButtonProps = {
  url: string
  title: string
}

export default function ShareButton({ url, title }: ShareButtonProps) {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(typeof navigator !== "undefined" && !!navigator.share)
  }, [])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        })
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error sharing:", error)
        }
      }
    }
  }

  if (!isSupported) return null

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 hover:text-primary"
      title="Share article"
    >
      <ShareIcon className="h-4 w-4" />
      Share
    </button>
  )
}
