import prisma from "../../../../lib/prisma"
import { Metadata } from "next"

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.news_article.findUnique({
    where: { id: params.id },
    include: { category: true },
  })

  if (!article) return { title: "Article Not Found" }

  return {
    title: article.title,
    description: article.body.substring(0, 160),
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.body.substring(0, 160),
      images: article.imageUrl ? [article.imageUrl] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.body.substring(0, 160),
      images: article.imageUrl ? [article.imageUrl] : [],
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

  if (!article) return <div>Article not found</div>

  // Increment view count
  await prisma.news_article.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
  })

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Article content here */}
    </article>
  )
}
