import { useMutation } from "@tanstack/react-query"

// Track which articles we've already attempted to track views for in this session
const viewedArticleIds = new Set<string>()

export function useTrackView() {
  return useMutation({
    mutationFn: async (articleId: string) => {
      if (viewedArticleIds.has(articleId)) {
        return null
      }

      viewedArticleIds.add(articleId)

      const response = await fetch(`/api/articles/${articleId}/views`, {
        method: "POST",
      })

      if (response.status === 429) {
        return null
      }

      const data = await response.json()

      if (data.error === "Already viewed") {
        return null
      }

      if (!response.ok) {
        throw new Error("Failed to track view")
      }

      return data
    },
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
