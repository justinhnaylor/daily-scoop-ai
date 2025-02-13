import { useMutation } from "@tanstack/react-query"

export function useTrackView() {
  return useMutation({
    mutationFn: async (articleId: string) => {
      const response = await fetch(`/api/articles/${articleId}/views`, {
        method: "POST",
      })

      if (response.status === 429) {
        // Rate limit exceeded - silently fail
        return null
      }

      const data = await response.json()

      if (data.error === "Already viewed") {
        // Article already viewed - silently succeed
        return null
      }

      if (!response.ok) {
        throw new Error("Failed to track view")
      }

      return data
    },
    // Don't retry on rate limit or already viewed
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        (error.message.includes("429") ||
          error.message.includes("Already viewed"))
      ) {
        return false
      }
      return failureCount < 3
    },
  })
}
