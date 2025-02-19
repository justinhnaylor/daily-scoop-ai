"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Category } from "@/types"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { TypographyP } from "../ui/typography"
import { useState, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

interface Props {
  categories: Category[]
  selectedCategory: number | null
  onOptimisticChange: (category: number | null) => void
}

export default function CategoryScroll({
  categories,
  selectedCategory,
  onOptimisticChange,
}: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const { md, lg } = useMediaQuery()
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [optimisticCategory, setOptimisticCategory] = useState<number | null>(
    selectedCategory
  )

  const handleSelect = async (id: number | null) => {
    if (isDragging) return

    setOptimisticCategory(id)
    onOptimisticChange(id)

    // Force the loading state immediately
    queryClient.cancelQueries({ queryKey: ["articles", selectedCategory] })
    queryClient.resetQueries({ queryKey: ["articles", id] })

    // Start fetching the new data immediately
    queryClient.prefetchInfiniteQuery({
      queryKey: ["articles", id],
      queryFn: async () => {
        const res = await fetch(
          `/api/articles?${id ? `category=${id}&` : ""}page=1`
        )
        return res.json()
      },
      initialPageParam: 1,
    })

    const params = new URLSearchParams(searchParams.toString())
    if (id === null) {
      params.delete("category")
    } else {
      params.set("category", id.toString())
    }
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.75
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`category-scroll flex pb-4 ${
        lg
          ? "flex-wrap max-h-[110px] -mr-8 pr-4 gap-2"
          : md
          ? "gap-2"
          : "flex-nowrap gap-1.5 overflow-x-auto hover:scrollbar-visible scrollbar-hide"
      } ${isDragging ? "cursor-grabbing select-none" : "cursor-grab"} ${
        !isDragging ? "transition-all duration-300 ease-out" : ""
      }`}
    >
      <button
        onClick={() => handleSelect(null)}
        className={`${
          lg
            ? "flex-initial text-sm px-3.5"
            : md
            ? "text-sm px-3"
            : "flex-none text-xs px-2"
        } py-1 rounded-full whitespace-nowrap ${
          optimisticCategory === null
            ? "bg-background"
            : "bg-foreground/10 hover:bg-foreground/20"
        }`}
      >
        <TypographyP className="font-medium">All Stories</TypographyP>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleSelect(category.id)}
          className={`${
            lg
              ? "flex-initial text-sm px-3.5"
              : md
              ? "text-sm px-3"
              : "flex-none text-xs px-2"
          } px-2.5 py-1 rounded-full whitespace-nowrap ${
            optimisticCategory === category.id
              ? "bg-background"
              : "bg-foreground/10 hover:bg-foreground/20"
          }`}
        >
          <TypographyP className="font-medium">{category.name}</TypographyP>
        </button>
      ))}
    </div>
  )
}
