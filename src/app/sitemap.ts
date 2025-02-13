import prisma from "../../lib/prisma"
import { MetadataRoute } from "next"

type ArticleResult = {
  id: string
  updatedAt: Date
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.news_article.findMany({
    where: { published: true },
    select: {
      id: true,
      updatedAt: true,
    },
  })

  const articleUrls = articles.map((article: ArticleResult) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/articles/${article.id}`,
    lastModified: article.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }))

  return [
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...articleUrls,
  ]
}
