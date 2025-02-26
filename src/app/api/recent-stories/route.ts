import { NextResponse } from "next/server"
import { getCachedRecentStories } from "../../page"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get("category")
    ? parseInt(searchParams.get("category")!)
    : null
  const page = parseInt(searchParams.get("page") ?? "1")
  const theme = searchParams.get("theme") ?? "light"
  const limit = 10

  const data = await getCachedRecentStories(categoryId, theme, page, limit)
  return NextResponse.json(data)
}
