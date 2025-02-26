/**
 * Simple event system for navigation state changes
 */
type NavigationEventType = "start" | "done"
type Listener = () => void

const listeners: Record<NavigationEventType, Listener[]> = {
  start: [],
  done: [],
}

export const navigationEvents = {
  /**
   * Trigger navigation start - shows the progress bar
   */
  start: () => {
    listeners.start.forEach((listener) => listener())
  },

  /**
   * Complete navigation - finishes the progress bar
   */
  done: () => {
    listeners.done.forEach((listener) => listener())
  },

  /**
   * Add event listener
   */
  on: (event: NavigationEventType, callback: Listener) => {
    listeners[event].push(callback)
    return () => {
      const index = listeners[event].indexOf(callback)
      if (index !== -1) listeners[event].splice(index, 1)
    }
  },
}
