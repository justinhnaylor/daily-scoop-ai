import { NextResponse } from "next/server"
import prisma from "../../../../lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get("category")
    ? parseInt(searchParams.get("category")!)
    : null
  const page = parseInt(searchParams.get("page") ?? "1")
  const theme = searchParams.get("theme") ?? "light"
  const limit = 10
  const skip = (page - 1) * limit

  const DEFAULT_BANNER =
    theme === "dark"
      ? "/daily-scoop-banner-dark.webp"
      : "/daily-scoop-banner-light.webp"

  const DEFAULT_THUMBNAIL =
    theme === "dark"
      ? "/daily-scoop-icon-dark.webp"
      : "/daily-scoop-icon-light.webp"

  const [articles, total] = await Promise.all([
    prisma.news_article.findMany({
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
    }),
    prisma.news_article.count({
      where: {
        published: true,
        ...(categoryId ? { categoryId } : {}),
      },
    }),
  ])

  const processedArticles = articles.map((article) => ({
    ...article,
    imageUrl: article.useImage ? article.imageUrl : DEFAULT_BANNER,
    thumbnailUrl: article.useImage ? article.thumbnailUrl : DEFAULT_THUMBNAIL,
  }))

  return NextResponse.json({
    articles: processedArticles,
    hasMore: skip + articles.length < total,
  })
}
