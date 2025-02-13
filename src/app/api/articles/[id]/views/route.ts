import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { cookies } from "next/headers"
import prisma from "../../../../../../lib/prisma"
import { rateLimit } from "@/lib/rateLimit"

// Configuration
const RATE_LIMIT = 5 // views per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const VIEW_COOKIE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const cookieStore = await cookies()

    // Get article ID from URL
    const pathParts = request.url.split("/")
    const id = pathParts[pathParts.length - 2] // Get the ID before 'views'

    if (!id) {
      console.error("Article ID not found in URL")
      return NextResponse.json(
        { error: "Article ID not found" },
        { status: 400 }
      )
    }

    // Get IP address
    const ip = headersList.get("x-forwarded-for") || "unknown"

    // Check for existing view cookie for this article
    if (cookieStore.get(`article-view-${id}`)) {
      return NextResponse.json(
        { error: "Already viewed", views: null },
        { status: 200 }
      )
    }

    // Check if article exists
    const articleExists = await prisma.news_article.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!articleExists) {
      console.error("Article not found:", id)
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    // Create rate‑limit identifiers
    const ipIdentifier = `ip-${ip}`
    const articleIdentifier = `article-${id}`
    const combinedIdentifier = `${ip}-${id}`

    // Check rate limits; await if asynchronous
    const allowed = await rateLimit(
      [ipIdentifier, articleIdentifier, combinedIdentifier],
      RATE_LIMIT,
      RATE_LIMIT_WINDOW
    )
    if (!allowed) {
      console.error("Rate limit exceeded")
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      )
    }

    // Increment view count
    const updatedArticle = await prisma.news_article.update({
      where: { id },
      data: {
        views: { increment: 1 },
      },
    })

    // Create response and set cookie to track this view
    const response = NextResponse.json({ views: updatedArticle.views })
    response.cookies.set({
      name: `article-view-${id}`,
      value: "true",
      expires: new Date(Date.now() + VIEW_COOKIE_EXPIRY),
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error updating views:", error)
    console.log("Error type:", typeof error)
    console.log("Error details:", error)
    const payload = { error: "Internal server error" }
    return new NextResponse(JSON.stringify(payload), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
