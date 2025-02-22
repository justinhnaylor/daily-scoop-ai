"use client"

import ErrorPage from "@/components/ErrorPage"
import { useEffect } from "react"

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorPage
      code="500"
      message="Looks like we've encountered a twister. Our team of AI munchkins is working to fix it."
    />
  )
}
