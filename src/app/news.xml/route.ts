import { NextResponse } from "next/server"
import prisma from "../../../lib/prisma"
import type { Article } from "@/types"

export async function GET() {
  const articles = await prisma.news_article.findMany({
    where: {
      published: true,
      createdAt: {
        gte: new Date(Date.now() - 48 * 60 * 60 * 1000), // Last 48 hours
      },
    },
    include: {
      category: true,
      author: true,
    },
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
      ${articles
        .map(
          (article: Article) => `
        <url>
          <loc>${process.env.NEXT_PUBLIC_BASE_URL}/articles/${article.id}</loc>
          <news:news>
            <news:publication>
              <news:name>Daily Scoop AI</news:name>
              <news:language>en</news:language>
            </news:publication>
            <news:publication_date>${article.createdAt.toISOString()}</news:publication_date>
            <news:title>${article.title}</news:title>
            <news:keywords>${article.keywords.join(",")}</news:keywords>
          </news:news>
        </url>
      `
        )
        .join("")}
    </urlset>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
