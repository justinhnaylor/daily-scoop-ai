import { useQuery } from "@tanstack/react-query"
import { useTheme } from "next-themes"

export function useTrendingArticles() {
  const { theme } = useTheme()

  return useQuery({
    queryKey: ["trending-articles", theme],
    queryFn: () =>
      fetch(`/api/articles/trending?theme=${theme}`).then((res) => res.json()),
  })
}

export function useArticles(categoryId: number | null, page: number) {
  const { theme } = useTheme()

  return useQuery({
    queryKey: ["articles", categoryId, page, theme],
    queryFn: () =>
      fetch(
        `/api/articles?${
          categoryId ? `category=${categoryId}&` : ""
        }page=${page}&theme=${theme}`
      ).then((res) => res.json()),
  })
}
