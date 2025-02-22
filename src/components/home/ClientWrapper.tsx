"use client"

import { useState } from "react"
import CategoryScroll from "./CategoryScroll"
import StoryList from "./StoryList"
import { Article, Category } from "@/types"

interface ClientWrapperProps {
  categories: Category[]
  selectedCategory: number | null
  initialStories: Article[]
  hasMore: boolean
}

export default function ClientWrapper({
  categories,
  selectedCategory,
  initialStories,
  hasMore,
}: ClientWrapperProps) {
  const [optimisticCategory, setOptimisticCategory] = useState<number | null>(
    selectedCategory
  )

  return (
    <>
      <CategoryScroll
        categories={categories}
        selectedCategory={selectedCategory}
        optimisticCategory={optimisticCategory}
        onOptimisticChange={setOptimisticCategory}
      />
      <StoryList
        initialStories={initialStories}
        categoryId={selectedCategory}
        hasMore={hasMore}
        optimisticCategory={optimisticCategory}
      />
    </>
  )
}
