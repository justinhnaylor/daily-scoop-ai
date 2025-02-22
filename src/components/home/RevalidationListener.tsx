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
    if (permission === "default") {
      requestPermission()
    }
  }, [permission, requestPermission])

  useEffect(() => {
    const eventSource = new EventSource("/api/revalidate/listen")
    let documentHidden = document.hidden

    const handleVisibilityChange = () => {
      documentHidden = document.hidden
      if (!document.hidden) {
        FaviconManager.removeNotificationDot()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    eventSource.onmessage = async (event) => {
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
    }

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error)
    }

    return () => {
      eventSource.close()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [queryClient, sendNotification])

  return <>{children}</>
}
