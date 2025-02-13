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
import { Article } from "@/types"

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
      images: ["/og-image.jpg"], // Add a default OG image
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

async function getTrendingStories() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const DEFAULT_BANNER =
    "https://dymrplcuovidgyepquba.supabase.co/storage/v1/object/public/images//d_news_banner.webp"
  const DEFAULT_THUMBNAIL =
    "https://dymrplcuovidgyepquba.supabase.co/storage/v1/object/public/images//d_news_thumbnail.webp"

  const stories = await prisma.news_article.findMany({
    where: {
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
      thumbnailUrl: true,
      useImage: true,
      views: true,
      published: true,
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
  }

  const processedStories = stories.map((story: StoryResult) => ({
    ...story,
    imageUrl: story.useImage ? story.imageUrl : DEFAULT_BANNER,
    thumbnailUrl: story.useImage ? story.thumbnailUrl : DEFAULT_THUMBNAIL,
  }))

  return processedStories
}

async function getRecentStories(categoryId: number | null = null) {
  const DEFAULT_BANNER =
    "https://dymrplcuovidgyepquba.supabase.co/storage/v1/object/public/images//d_news_banner.webp"
  const DEFAULT_THUMBNAIL =
    "https://dymrplcuovidgyepquba.supabase.co/storage/v1/object/public/images//d_news_thumbnail.webp"

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
    take: 20,
  })

  const processedStories = stories.map((story: Article) => ({
    ...story,
    imageUrl: story.useImage ? story.imageUrl : DEFAULT_BANNER,
    thumbnailUrl: story.useImage ? story.thumbnailUrl : DEFAULT_THUMBNAIL,
  }))

  return processedStories
}

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function Home({ searchParams }: Props) {
  // Await the promise to get the search parameters
  const { category } = await searchParams
  const categoryId = category ? parseInt(category) : null

  const queryClient = new QueryClient()

  // Prefetch data for trending articles
  await queryClient.prefetchQuery({
    queryKey: ["trending-articles"],
    queryFn: () =>
      fetch(`${process.env.BASE_URL}/api/articles/trending`).then((res) =>
        res.json()
      ),
  })

  // Prefetch articles for the given category on page 1
  await queryClient.prefetchQuery({
    queryKey: ["articles", categoryId, 1],
    queryFn: () =>
      fetch(
        `/api/articles?${categoryId ? `category=${categoryId}&` : ""}page=1`
      ).then((res) => res.json()),
  })

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })

  const [trendingStories, recentStories] = await Promise.all([
    getTrendingStories(),
    getRecentStories(categoryId),
  ])

  console.log("Trending Stories:", trendingStories)
  console.log("Recent Stories:", recentStories)
  console.log("Categories:", categories)

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
              selectedCategory={categoryId}
            />
            <StoryList stories={recentStories} />
          </Suspense>
        </section>
      </main>
    </HydrationBoundary>
  )
}
