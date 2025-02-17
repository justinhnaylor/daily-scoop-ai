import { NextResponse } from "next/server"
import prisma from "../../../../../lib/prisma"
import type { TrendingArticle } from "@/types"

const DEFAULT_BANNER =
  "https://dymrplcuovidgyepquba.supabase.co/storage/v1/object/public/images//d_news_banner.webp"
const DEFAULT_THUMBNAIL =
  "https://dymrplcuovidgyepquba.supabase.co/storage/v1/object/public/images//d_news_thumbnail.webp"

export async function GET() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const articles = await prisma.news_article.findMany({
    where: {
      published: true,
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
      createdAt: true,
      keywords: true,
    },
  })

  const processedArticles = articles.map((article: TrendingArticle) => ({
    ...article,
    imageUrl: article.useImage ? article.imageUrl : DEFAULT_BANNER,
    thumbnailUrl: article.useImage ? article.thumbnailUrl : DEFAULT_THUMBNAIL,
  }))

  return NextResponse.json(processedArticles)
}
