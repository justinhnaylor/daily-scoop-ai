import prisma from "../../../../lib/prisma"
import { Metadata } from "next"
import type { Article } from "@/types"
interface Props {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
  })

  const keywords = [
    `${category?.name || "Latest"} news`,
    "ai news",
    "daily updates",
  ]

  if (category?.name) {
    keywords.push(category.name.toLowerCase())
  }

  return {
    title: `${category?.name} News - Daily Scoop AI`,
    description: `Latest ${category?.name} news and updates from Daily Scoop AI. Stay informed with our AI-powered news coverage.`,
    keywords,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
    include: {
      articles: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
        },
      },
    },
  })

  if (!category) return null

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{category.name}</h1>
      <div className="grid gap-6">
        {category.articles.map((article: Article) => (
          // Add your article list component here
          <div key={article.id}>{article.title}</div>
        ))}
      </div>
    </main>
  )
}
