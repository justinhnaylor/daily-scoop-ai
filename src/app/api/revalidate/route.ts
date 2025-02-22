import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import prisma from "../../../../lib/prisma"
import { clients, getLastCheckTime, setLastCheckTime } from "./clients"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (token !== process.env.REVALIDATION_TOKEN) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 })
  }

  try {
    // Check for new articles since last check
    const newArticles = await prisma.news_article.findFirst({
      where: {
        published: true,
        createdAt: {
          gt: getLastCheckTime(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Update last check time
    setLastCheckTime(new Date())

    // Revalidate all necessary paths
    revalidatePath("/", "layout")
    revalidatePath("/articles/[year]/[month]/[day]/[title]", "page")
    revalidatePath("/api/articles", "page")
    revalidatePath("/api/articles/trending", "page")

    // Notify clients with appropriate event type
    for (const controller of clients) {
      try {
        const eventData = newArticles
          ? "data: new-content\n\n"
          : "data: revalidate\n\n"
        controller.enqueue(new TextEncoder().encode(eventData))
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.message.includes("Controller is already closed")
        ) {
          clients.delete(controller)
        }
      }
    }

    return new NextResponse(
      JSON.stringify({
        revalidated: true,
        hasNewContent: !!newArticles,
        now: Date.now(),
      }),
      {
        status: 200,
        headers: {
          "X-Revalidated": "true",
          "Content-Type": "application/json",
        },
      }
    )
  } catch (error: unknown) {
    // Log the error for debugging
    console.error("Revalidation error:", error)
    return NextResponse.json(
      {
        message: "Error revalidating",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
