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
      return NextResponse.json(
        { error: "Article ID not found" },
        { status: 400 }
      )
    }

    // Get IP address
    const ip = headersList.get("x-forwarded-for") || "unknown"

    // Check for existing view cookie for this article
    const viewCookie = cookieStore.get(`article-view-${id}`)
    if (viewCookie) {
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
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    // Create identifiers for rate limiting
    const ipIdentifier = `ip-${ip}`
    const articleIdentifier = `article-${id}`
    const combinedIdentifier = `${ip}-${id}`

    // Check rate limits
    const allowed = rateLimit(
      [ipIdentifier, articleIdentifier, combinedIdentifier],
      RATE_LIMIT,
      RATE_LIMIT_WINDOW
    )

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      )
    }

    // Increment view count
    const article = await prisma.news_article.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    })

    // Create response with cookie
    const response = NextResponse.json({ views: article.views })

    // Set cookie to track this view
    response.cookies.set({
      name: `article-view-${id}`,
      value: "true",
      expires: new Date(Date.now() + VIEW_COOKIE_EXPIRY),
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error incrementing views:", error)
    return NextResponse.json(
      {
        error: "Failed to increment views",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
