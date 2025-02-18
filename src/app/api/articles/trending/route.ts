import { NextResponse } from "next/server"
import prisma from "../../../../../lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const theme = searchParams.get("theme") ?? "light"

  const DEFAULT_BANNER = {
    light: "/daily-scoop-banner-light.webp",
    dark: "/daily-scoop-banner-dark.webp",
  }

  const DEFAULT_THUMBNAIL = {
    light: "/daily-scoop-icon-light.webp",
    dark: "/daily-scoop-icon-dark.webp",
  }

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
      urlTitle: true,
      keywords: true,
    },
  })

  const processedArticles = articles.map((article) => ({
    ...article,
    defaultImages: {
      banner: DEFAULT_BANNER,
      thumbnail: DEFAULT_THUMBNAIL,
    },
    imageUrl: article.useImage
      ? article.imageUrl
      : DEFAULT_BANNER[theme as "light" | "dark"],
    thumbnailUrl: article.useImage
      ? article.thumbnailUrl
      : DEFAULT_THUMBNAIL[theme as "light" | "dark"],
  }))

  return NextResponse.json(processedArticles)
}
