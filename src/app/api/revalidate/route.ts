import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (token !== process.env.REVALIDATION_TOKEN) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 })
  }

  try {
    // Revalidate the home page
    revalidatePath("/")
    // Revalidate all article pages
    revalidatePath("/articles/[id]")
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (error) {
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
