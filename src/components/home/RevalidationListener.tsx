"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useNotifications } from "@/hooks/useNotifications"
import { FaviconManager } from "@/utils/faviconManager"

export default function RevalidationListener({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = useQueryClient()
  const { permission, requestPermission, sendNotification } = useNotifications()

  useEffect(() => {
    if (typeof window === "undefined") return

    if (permission === "default") {
      requestPermission()
    }
  }, [permission, requestPermission])

  useEffect(() => {
    if (typeof window === "undefined") return

    let eventSource: EventSource | null = null
    let documentHidden = false
    let visibilityHandler: ((event: Event) => void) | null = null

    try {
      eventSource = new EventSource("/api/revalidate/listen")
      documentHidden = document.hidden

      visibilityHandler = () => {
        documentHidden = document.hidden
        if (!document.hidden) {
          FaviconManager.removeNotificationDot()
        }
      }

      document.addEventListener("visibilitychange", visibilityHandler)

      eventSource.onmessage = async (event) => {
        try {
          // Force refetch all queries
          await queryClient.refetchQueries({
            type: "all",
            stale: true,
            exact: false,
          })

          // Only show notifications for new content
          if (event.data === "new-content" && documentHidden) {
            sendNotification("New Content Available", {
              body: "New articles have been published!",
              icon: "/favicon.ico",
            })
            FaviconManager.addNotificationDot()
          }
        } catch (error) {
          console.error("Error handling message:", error)
        }
      }

      eventSource.onerror = (error) => {
        console.error("EventSource error:", error)
        if (eventSource) {
          eventSource.close()
        }
      }
    } catch (error) {
      console.error("Error setting up EventSource:", error)
    }

    return () => {
      if (eventSource) {
        eventSource.close()
      }
      if (typeof document !== "undefined" && visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler)
      }
    }
  }, [queryClient, sendNotification])

  return <>{children}</>
}
