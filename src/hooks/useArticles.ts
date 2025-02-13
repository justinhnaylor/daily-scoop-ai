import { useQuery } from "@tanstack/react-query"

export function useTrendingArticles() {
  return useQuery({
    queryKey: ["trending-articles"],
    queryFn: () => fetch("/api/articles/trending").then((res) => res.json()),
  })
}

export function useArticles(categoryId: number | null, page: number) {
  return useQuery({
    queryKey: ["articles", categoryId, page],
    queryFn: () =>
      fetch(
        `/api/articles?${
          categoryId ? `category=${categoryId}&` : ""
        }page=${page}`
      ).then((res) => res.json()),
  })
}
