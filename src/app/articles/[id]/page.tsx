import prisma from "../../../../lib/prisma"
import { Metadata } from "next"
import { notFound } from "next/navigation"

const DEFAULT_BANNER =
  "https://dymrplcuovidgyepquba.supabase.co/storage/v1/object/public/images//d_news_banner.webp"

interface Props {
  params: { id: string }
}

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
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.body.substring(0, 160),
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const article = await prisma.news_article.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      author: true,
    },
  })

  if (!article || !article.published) return notFound()

  // Increment view count
  await prisma.news_article.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
  })

  const imageUrl = article.useImage ? article.imageUrl : DEFAULT_BANNER

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Article content here with imageUrl */}
    </article>
  )
}
