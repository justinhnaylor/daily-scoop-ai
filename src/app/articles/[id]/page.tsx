import prisma from "../../../../lib/prisma"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import ArticleLayout from "./layout"
import type { Article } from "@/types"

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query"

const DEFAULT_BANNER =
  "https://dymrplcuovidgyepquba.supabase.co/storage/v1/object/public/images//d_news_banner.webp"
const DEFAULT_THUMBNAIL =
  "https://dymrplcuovidgyepquba.supabase.co/storage/v1/object/public/images//d_news_thumbnail.webp"

interface Props {
  params: { id: string }
}

// Pre-generate most recent articles at build time
export async function generateStaticParams() {
  const articles = await prisma.news_article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 100, // Pre-generate most recent 100 articles
    select: { id: true },
  })

  return articles.map((article: Article) => ({
    id: article.id,
  }))
}

// Enable dynamic rendering for new articles
export const dynamicParams = true

// Add revalidation to update static pages periodically
export const revalidate = 3600 // revalidate every hour

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.news_article.findUnique({
    where: { id: params.id },
    include: { category: true },
  })

  if (!article || !article.published) return notFound()

  const imageUrl = article.useImage ? article.imageUrl : DEFAULT_BANNER

  return {
    title: article.title,
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
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.body.substring(0, 160),
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `/articles/${article.id}`,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const queryClient = new QueryClient()

  const article = await prisma.news_article.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      author: true,
    },
  })

  if (!article || !article.published) return notFound()

  await queryClient.prefetchQuery({
    queryKey: ["article", params.id],
    queryFn: () => article,
  })

  const processedArticle = {
    ...article,
    imageUrl: article.useImage ? article.imageUrl : DEFAULT_BANNER,
    thumbnailUrl: article.useImage ? article.thumbnailUrl : DEFAULT_THUMBNAIL,
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ArticleLayout article={processedArticle} />
    </HydrationBoundary>
  )
}
