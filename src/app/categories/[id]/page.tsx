import prisma from "../../../../lib/prisma"
import { Metadata } from "next"

interface Props {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { id: parseInt(params.id) },
  })

  return {
    title: `${category?.name} News - Daily Scoop AI`,
    description: `Latest ${category?.name} news and updates from Daily Scoop AI. Stay informed with our AI-powered news coverage.`,
    keywords: [
      `${category?.name} news`,
      "ai news",
      "daily updates",
      category?.name?.toLowerCase(),
    ],
  }
}
