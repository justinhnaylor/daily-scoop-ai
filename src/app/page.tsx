import { Suspense } from "react"
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query"
import TrendingCarousel from "@/components/home/TrendingCarousel"
import CategoryScroll from "@/components/home/CategoryScroll"
import StoryList from "@/components/home/StoryList"
import prisma from "../../lib/prisma"

export async function generateMetadata() {
  return {
    title: "Daily Scoop AI - Latest News",
    description: "Get the latest news and updates from Daily Scoop AI",
    keywords: ["news", "ai", "daily", "updates"],
  }
}

async function getTrendingStories() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  return prisma.news_article.findMany({
    where: {
      published: true,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      views: "desc",
    },
    take: 5,
    select: {
      id: true,
      title: true,
      imageUrl: true,
      views: true,
    },
  })
}

async function getRecentStories(categoryId: number | null = null) {
  return prisma.news_article.findMany({
    where: {
      published: true,
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
    take: 20,
  })
}

export default async function Home() {
  const queryClient = new QueryClient()

  // Prefetch data
  await queryClient.prefetchQuery({
    queryKey: ["trending-articles"],
    queryFn: () =>
      fetch(`${process.env.BASE_URL}/api/articles/trending`).then((res) =>
        res.json()
      ),
  })

  const [trendingStories, recentStories, categories] = await Promise.all([
    getTrendingStories(),
    getRecentStories(),
    prisma.category.findMany(),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-12">
          <h1 className="text-2xl font-bold mb-6">Trending Stories</h1>
          <Suspense fallback={<div>Loading...</div>}>
            <TrendingCarousel stories={trendingStories} />
          </Suspense>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Recent Stories</h2>
          <Suspense fallback={<div>Loading...</div>}>
            <CategoryScroll
              categories={categories}
              selectedCategory={null}
              onSelect={(id) => {
                const url = new URL(window.location.href)
                if (id === null) {
                  url.searchParams.delete("category")
                } else {
                  url.searchParams.set("category", id.toString())
                }
                window.history.pushState({}, "", url)
              }}
            />
            <StoryList stories={recentStories} />
          </Suspense>
        </section>
      </main>
    </HydrationBoundary>
  )
}
