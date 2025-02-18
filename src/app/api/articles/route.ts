import { NextResponse } from "next/server"
import prisma from "../../../../lib/prisma"
import type { TrendingArticle } from "@/types"

const DEFAULT_BANNER = "/daily-scoop-banner-light.webp"
const DEFAULT_THUMBNAIL = "/daily-scoop-thumb-light.webp"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get("category")
    ? parseInt(searchParams.get("category")!)
    : null
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = 10

  const articles = await prisma.news_article.findMany({
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
    skip: (page - 1) * limit,
  })

  const processedArticles = articles.map((article: TrendingArticle) => ({
    ...article,
    imageUrl: article.useImage ? article.imageUrl : DEFAULT_BANNER,
    thumbnailUrl: article.useImage ? article.thumbnailUrl : DEFAULT_THUMBNAIL,
  }))

  const total = await prisma.news_article.count({
    where: {
      published: true,
      ...(categoryId ? { categoryId } : {}),
    },
  })

  return NextResponse.json({
    articles: processedArticles,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  })
}
