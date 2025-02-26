import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (token !== process.env.REVALIDATION_TOKEN) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 })
  }

  try {
    revalidatePath("/", "layout")
    revalidatePath("/articles/[year]/[month]/[day]/[title]", "page")
    revalidatePath("/api/articles", "page")
    revalidatePath("/api/articles/trending", "page")

    return NextResponse.json(
      { revalidated: true, now: Date.now() },
      { status: 200 }
    )
  } catch (error) {
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
