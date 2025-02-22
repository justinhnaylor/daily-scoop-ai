"use client"

import { EyeIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { Article } from "@/types"
import { useTheme } from "next-themes"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"
import { useInView } from "react-intersection-observer"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import SkeletonStoryList from "./skeletons/SkeletonStoryList"
import { TypographyH4, TypographyMuted } from "@/components/ui/typography"

interface StoryListProps {
  initialStories: Article[]
  categoryId: number | null
  hasMore: boolean
  optimisticCategory?: number | null
}

export default function StoryList({
  initialStories,
  categoryId,
  hasMore,
  optimisticCategory,
}: StoryListProps) {
  const { theme } = useTheme()
  const { lg, md, sm } = useMediaQuery()
  const { ref, inView } = useInView()

  const fetchStories = async ({ pageParam = 1 }) => {
    const res = await fetch(
      `/api/articles?${
        categoryId ? `category=${categoryId}&` : ""
      }page=${pageParam}&theme=${theme}`
    )
    return res.json()
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["articles", categoryId],
    queryFn: fetchStories,
    initialPageParam: 1,
    initialData: {
      pages: [{ articles: initialStories, hasMore }],
      pageParams: [1],
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage])

  const allStories = data?.pages.flatMap((page) => page.articles) ?? []

  if (optimisticCategory !== undefined && optimisticCategory !== categoryId) {
    return <SkeletonStoryList />
  }

  if (isLoading || (isFetching && !isFetchingNextPage)) {
    return <SkeletonStoryList />
  }

  if (allStories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-foreground/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <TypographyH4>No News Found</TypographyH4>
        <TypographyMuted className="mt-2 max-w-sm">
          We&apos;re working on bringing you more articles in this category.
          Check back soon or explore other categories for the latest updates.
        </TypographyMuted>
      </div>
    )
  }

  return (
    <div className="grid gap-6 mt-6">
      {allStories.map((story, index) => {
        const defaultThumb =
          story.defaultImages?.thumbnail?.[theme as "light" | "dark"] ||
          story.defaultImages?.thumbnail?.light
        const imageUrl = story.useImage ? story.thumbnailUrl : defaultThumb
        const createdAt = new Date(story.createdAt)

        return (
          <Link
            key={story.id}
            href={`/articles/${createdAt.getFullYear()}/${
              createdAt.getMonth() + 1
            }/${createdAt.getDate()}/${story.urlTitle}`}
            className="flex gap-4 items-start hover:bg-foreground/5 p-4 rounded-lg transition-colors"
          >
            <div
              className={cn(
                "relative flex-shrink-0 rounded-lg overflow-hidden",
                lg
                  ? "w-32 h-32"
                  : md
                  ? "w-24 h-24"
                  : sm
                  ? "w-20 h-20"
                  : "w-16 h-16"
              )}
            >
              <Image
                src={imageUrl || defaultThumb || ""}
                alt={story.title}
                fill
                priority={index < 3}
                sizes="(max-width: 768px) 64px, (max-width: 1024px) 80px, (max-width: 1280px) 96px, 128px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-semibold mb-2",
                  lg ? "text-lg" : md ? "text-base" : "text-sm"
                )}
              >
                {story.title}
              </h3>
              <div
                className={cn(
                  "flex flex-wrap items-center gap-2 text-foreground/60",
                  lg ? "text-sm" : "text-xs"
                )}
              >
                {story.category && (
                  <span className="bg-foreground/10 px-2 py-0.5 rounded-full truncate max-w-[150px]">
                    {story.category.name}
                  </span>
                )}
                <div className="flex items-center">
                  <EyeIcon className={cn("mr-1", lg ? "h-4 w-4" : "h-3 w-3")} />
                  {story.views}
                </div>
                <time>{createdAt.toLocaleDateString()}</time>
              </div>
            </div>
          </Link>
        )
      })}

      {isFetchingNextPage && <SkeletonStoryList />}

      <div ref={ref} className="h-px" />
    </div>
  )
}
