interface RateLimitWindow {
  timestamp: number
  count: number
}

const rateLimitStore = new Map<string, RateLimitWindow>()

export function rateLimit(
  identifiers: string[],
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now()

  // Check all identifiers - if any are rate limited, return false
  for (const identifier of identifiers) {
    const window = rateLimitStore.get(identifier)

    // Clean up old entries
    if (window && now - window.timestamp > windowMs) {
      rateLimitStore.delete(identifier)
      continue
    }

    // If within window and at/over limit, deny
    if (window && window.count >= limit) {
      return false
    }
  }

  // If we get here, update all identifiers
  for (const identifier of identifiers) {
    const window = rateLimitStore.get(identifier)
    if (!window) {
      rateLimitStore.set(identifier, { timestamp: now, count: 1 })
    } else {
      window.count++
    }
  }

  return true
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, window] of rateLimitStore.entries()) {
    if (now - window.timestamp > 24 * 60 * 60 * 1000) {
      // Clean up after 24 hours
      rateLimitStore.delete(key)
    }
  }
}, 60 * 60 * 1000) // Run cleanup every hour
