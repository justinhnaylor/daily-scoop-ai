import prisma from "../../../../lib/prisma"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import ArticleComponent from "./ArticleComponent"
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

type Props = {
  params: Promise<{ id: string }>
}

// Pre-generate most recent articles at build time
export async function generateStaticParams() {
  const articles = await prisma.news_article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 100,
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

async function getArticle(articleId: string | undefined) {
  if (!articleId) return null

  const article = await prisma.news_article.findUnique({
    where: { id: articleId },
    include: {
      category: true,
      author: true,
    },
  })

  if (!article || !article.published) return null
  return article
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const article = await getArticle(id)

  if (!article) return notFound()

  const imageUrl = article.useImage ? article.imageUrl : DEFAULT_BANNER

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    ),
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
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/articles/${article.id}`,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const queryClient = new QueryClient()
  const { id } = await params
  const article = await getArticle(id)

  if (!article) return notFound()

  const processedArticle = {
    ...article,
    imageUrl: article.useImage ? article.imageUrl : DEFAULT_BANNER,
    thumbnailUrl: article.useImage ? article.thumbnailUrl : DEFAULT_THUMBNAIL,
    category: article.category || null,
    author: article.author || null,
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.body.substring(0, 160),
    image: article.imageUrl || DEFAULT_BANNER,
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
      "@id": `${process.env.NEXT_PUBLIC_BASE_URL}/articles/${article.id}`,
    },
  }

  await queryClient.prefetchQuery({
    queryKey: ["article", id],
    queryFn: () => processedArticle,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ArticleComponent article={processedArticle} />
      </HydrationBoundary>
    </>
  )
}
