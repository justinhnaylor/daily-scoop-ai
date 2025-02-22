import { Suspense } from "react"
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query"
import TrendingCarousel from "@/components/home/TrendingCarousel"
import prisma from "../../lib/prisma"
import { Article } from "@/types"
import SkeletonTrendingCarousel from "@/components/home/skeletons/SkeletonTrendingCarousel"
import SkeletonCategoryScroll from "@/components/home/skeletons/SkeletonCategoryScroll"
import SkeletonStoryList from "@/components/home/skeletons/SkeletonStoryList"
import ClientWrapper from "@/components/home/ClientWrapper"

export async function generateMetadata() {
  return {
    title: "Daily Scoop AI - AI-Powered News and Analysis",
    description:
      "Get real-time news updates and in-depth analysis powered by artificial intelligence. Stay informed with trending stories across politics, technology, business, and more.",
    keywords: [
      "AI news",
      "artificial intelligence news",
      "trending news",
      "real-time updates",
      "news analysis",
      "technology news",
      "political news",
      "business news",
    ],
    openGraph: {
      title: "Daily Scoop AI - AI-Powered News and Analysis",
      description:
        "Get real-time news updates and in-depth analysis powered by artificial intelligence.",
      images: ["/og-image.jpg"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Daily Scoop AI - AI-Powered News and Analysis",
      description:
        "Get real-time news updates and in-depth analysis powered by artificial intelligence.",
      images: ["/og-image.jpg"],
    },
  }
}

async function getTrendingStories(theme: string) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const DEFAULT_BANNER = {
    light: "/daily-scoop-banner-light.webp",
    dark: "/daily-scoop-banner-dark.webp",
  }

  const DEFAULT_THUMBNAIL = {
    light: "/daily-scoop-thumb-dark.webp",
    dark: "/daily-scoop-thumb-light.webp",
  }

  const stories = await prisma.news_article.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      views: "desc",
    },
    take: 8,
    select: {
      id: true,
      title: true,
      imageUrl: true,
      thumbnailUrl: true,
      useImage: true,
      views: true,
      published: true,
      createdAt: true,
      urlTitle: true,
    },
  })

  type StoryResult = {
    id: string
    title: string
    imageUrl: string | null
    thumbnailUrl: string | null
    useImage: boolean
    views: number
    published: boolean
    createdAt: Date
    urlTitle: string
  }

  const processedStories = stories.map((story: StoryResult) => ({
    ...story,
    defaultImages: {
      banner: DEFAULT_BANNER,
      thumbnail: DEFAULT_THUMBNAIL,
    },
    imageUrl: story.useImage
      ? story.imageUrl
      : DEFAULT_BANNER[theme as "light" | "dark"],
    thumbnailUrl: story.useImage
      ? story.thumbnailUrl
      : DEFAULT_THUMBNAIL[theme as "light" | "dark"],
  }))

  return processedStories
}

async function getRecentStories(
  categoryId: number | null = null,
  theme: string,
  page: number = 1,
  limit: number = 10
) {
  const DEFAULT_BANNER = {
    light: "/daily-scoop-banner-light.webp",
    dark: "/daily-scoop-banner-dark.webp",
  }

  const DEFAULT_THUMBNAIL = {
    light: "/daily-scoop-icon-light.webp",
    dark: "/daily-scoop-icon-dark.webp",
  }

  const skip = (page - 1) * limit

  const stories = await prisma.news_article.findMany({
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
    take: limit,
    skip,
  })

  const total = await prisma.news_article.count({
    where: {
      published: true,
      ...(categoryId ? { categoryId } : {}),
    },
  })

  const processedStories = stories.map((story: Article) => ({
    ...story,
    defaultImages: {
      banner: DEFAULT_BANNER,
      thumbnail: DEFAULT_THUMBNAIL,
    },
    imageUrl: story.useImage
      ? story.imageUrl
      : DEFAULT_BANNER[theme as "light" | "dark"],
    thumbnailUrl: story.useImage
      ? story.thumbnailUrl
      : DEFAULT_THUMBNAIL[theme as "light" | "dark"],
  }))

  return {
    stories: processedStories,
    hasMore: skip + stories.length < total,
  }
}

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function Home({ searchParams }: Props) {
  const { category } = await searchParams
  const categoryId = category ? parseInt(category) : null
  const queryClient = new QueryClient()

  // Prefetch data for trending articles
  await queryClient.prefetchQuery({
    queryKey: ["trending-articles", "light"],
    queryFn: () =>
      fetch(`${process.env.BASE_URL}/api/articles/trending?theme=light`).then(
        (res) => res.json()
      ),
  })

  // Prefetch articles for the given category on page 1
  await queryClient.prefetchQuery({
    queryKey: ["articles", categoryId, 1, "light"],
    queryFn: () =>
      fetch(
        `/api/articles?${
          categoryId ? `category=${categoryId}&` : ""
        }page=1&theme=light`
      ).then((res) => res.json()),
  })

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  const [trendingStories, recentStoriesData] = await Promise.all([
    getTrendingStories("light"),
    getRecentStories(categoryId, "light", 1, 10),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
        <section>
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 px-1 text-gray-900 dark:text-gray-50">
            Trending Stories
          </h1>
          <div className="rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
            <Suspense fallback={<SkeletonTrendingCarousel />}>
              <TrendingCarousel stories={trendingStories} />
            </Suspense>
          </div>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 px-1 text-gray-900 dark:text-gray-50">
            Recent Stories
          </h2>
          <div className="rounded-xl overflow-hidden bg-white dark:bg-background shadow-lg p-4">
            <Suspense
              fallback={
                <>
                  <SkeletonCategoryScroll />
                  <SkeletonStoryList />
                </>
              }
            >
              <ClientWrapper
                categories={categories}
                selectedCategory={categoryId}
                initialStories={recentStoriesData.stories}
                hasMore={recentStoriesData.hasMore}
              />
            </Suspense>
          </div>
        </section>
      </main>
    </HydrationBoundary>
  )
}
