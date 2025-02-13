import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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
      views: true,
      keywords: true,
    },
  })

  return NextResponse.json(articles)
}
