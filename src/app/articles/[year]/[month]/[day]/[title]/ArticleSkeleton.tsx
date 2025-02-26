"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/useMediaQuery"

export default function ArticleSkeleton() {
  const { md } = useMediaQuery()

  return (
    <>
      <nav className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-1">
          <Skeleton className="h-4 w-16" />
          {" / "}
          <Skeleton className="h-4 w-24" />
          {" / "}
          <Skeleton className="h-4 w-40" />
        </div>
      </nav>
      <article className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Skeleton className="w-full aspect-[16/9] md:aspect-[21/9] rounded-lg" />
          <Skeleton className="h-3 w-64 ml-4 mt-2" />
        </div>

        <div className="px-4">
          <Skeleton className={cn("h-10 w-full mb-4", md ? "h-12" : "h-10")} />

          <div className="mb-4">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-8">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-10" />
          </div>

          <Skeleton className="h-12 w-full mb-8 rounded-lg" />

          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
            <div className="py-2" />
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i + 6} className="h-6 w-full" />
            ))}
            <div className="py-2" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i + 12} className="h-6 w-full" />
            ))}
          </div>

          <Skeleton className="h-3 w-64 mt-6" />
        </div>

        <div className="mt-12 border-t pt-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="w-full h-48 mb-4 rounded-lg" />
                <Skeleton className="h-6 w-full mb-2" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </>
  )
}
