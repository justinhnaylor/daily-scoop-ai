import { useState, useEffect } from "react"

export function useNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default")

  useEffect(() => {
    setPermission(Notification.permission)
  }, [])

  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === "granted") {
      return new Notification(title, options)
    }
    return null
  }

  return { permission, requestPermission, sendNotification }
}
