"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Category } from "@/types"

interface Props {
  categories: Category[]
  selectedCategory: number | null
}

export default function CategoryScroll({
  categories,
  selectedCategory,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelect = (id: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id === null) {
      params.delete("category")
    } else {
      params.set("category", id.toString())
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      <button
        onClick={() => handleSelect(null)}
        className={`px-4 py-2 rounded-full whitespace-nowrap ${
          selectedCategory === null
            ? "bg-primary text-primary-foreground"
            : "bg-foreground/10 hover:bg-foreground/20"
        }`}
      >
        All Stories
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleSelect(category.id)}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            selectedCategory === category.id
              ? "bg-primary text-primary-foreground"
              : "bg-foreground/10 hover:bg-foreground/20"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
