import prisma from "../../../../../../../lib/prisma"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import ArticleComponent from "./ArticleComponent"

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query"

import type { Article } from "@/types"

const DEFAULT_BANNER = {
  light: "/daily-scoop-banner-light.webp",
  dark: "/daily-scoop-banner-dark.webp",
}

const DEFAULT_THUMBNAIL = {
  light: "/daily-scoop-icon-light.webp",
  dark: "/daily-scoop-icon-dark.webp",
}

type Props = {
  params: Promise<{
    year: string
    month: string
    day: string
    title: string
    urlTitle: string
  }>
}

// Pre-generate most recent articles at build time
export async function generateStaticParams() {
  const articles = await prisma.news_article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, title: true, createdAt: true, urlTitle: true },
  })

  return articles.map((article) => {
    const date = new Date(article.createdAt)
    return {
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString().padStart(2, "0"),
      day: date.getDate().toString().padStart(2, "0"),
      title: article?.urlTitle,
    }
  })
}

// Enable dynamic rendering for new articles
export const dynamicParams = true

// Add revalidation to update static pages periodically
export const revalidate = 3600 // revalidate every hour

async function getArticle(
  year: string,
  month: string,
  day: string,
  title: string
) {
  // Create UTC date range for the specific day with a buffer
  const startDate = new Date(
    Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      -12, // Start 12 hours before the day
      0,
      0,
      0
    )
  )

  const endDate = new Date(
    Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      35,
      59,
      59,
      999
    )
  )

  console.log("Article search params:", {
    urlTitle: title,
    dateRange: {
      from: startDate.toISOString(),
      to: endDate.toISOString(),
    },
  })

  const article = await prisma.news_article.findFirst({
    where: {
      urlTitle: title,
      published: true,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
      author: true,
    },
  })

  console.log("Article search result:", {
    found: !!article,
    articleDate: article?.createdAt?.toISOString(),
    published: article?.published,
    urlTitle: article?.urlTitle,
  })

  if (!article || !article.published) {
    return null
  }

  return article
}

async function getRelatedArticles(article: Article) {
  return prisma.news_article.findMany({
    where: {
      published: true,
      id: { not: article.id },
      OR: [
        { categoryId: article.categoryId },
        { keywords: { hasSome: article.keywords } },
      ],
    },
    take: 3,
    orderBy: {
      views: "desc",
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  })
}

const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim() || ""
const validBaseUrl =
  rawBaseUrl.startsWith("http://") || rawBaseUrl.startsWith("https://")
    ? rawBaseUrl
    : "http://localhost:3000"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, month, day, title } = await params
  const article = await getArticle(year, month, day, title)

  if (!article) return notFound()

  const imageUrl = article.useImage ? article.imageUrl : DEFAULT_BANNER.light

  return {
    metadataBase: new URL(validBaseUrl),
    title: `${article.title} | Daily Scoop AI`,
    description: article.body.substring(0, 160),
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.body.substring(0, 160),
      images: imageUrl ? [imageUrl] : [],
      type: "article",
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      section: article.category?.name,
      tags: article.keywords,
      authors: article.author?.name ? [article.author.name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.body.substring(0, 160),
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${validBaseUrl}/articles/${article.id}`,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const queryClient = new QueryClient()
  const { year, month, day, title } = await params
  const article = await getArticle(year, month, day, title)

  if (!article) return notFound()

  const processedArticle = {
    ...article,
    defaultImages: {
      banner: DEFAULT_BANNER,
      thumbnail: DEFAULT_THUMBNAIL,
    },
    imageUrl: article.useImage ? article.imageUrl : DEFAULT_BANNER.light,
    thumbnailUrl: article.useImage
      ? article.thumbnailUrl
      : DEFAULT_THUMBNAIL.light,
    category: article.category || null,
    author: article.author || null,
  }

  const relatedArticles = await getRelatedArticles(processedArticle)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.body.substring(0, 160),
    image: article.imageUrl || DEFAULT_BANNER.light,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author?.name || "Daily Bot",
    },
    keywords: article.keywords.join(", "),
    articleSection: article.category?.name,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${validBaseUrl}/articles/${article.id}`,
    },
  }

  await queryClient.prefetchQuery({
    queryKey: ["article", `${year}-${month}-${day}-${title}`],
    queryFn: () => ({ article: processedArticle, relatedArticles }),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ArticleComponent
          article={processedArticle}
          relatedArticles={relatedArticles}
        />
      </HydrationBoundary>
    </>
  )
}
