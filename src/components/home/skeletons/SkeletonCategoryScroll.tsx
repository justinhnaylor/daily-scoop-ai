import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonCategoryScroll() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      <Skeleton className="h-10 w-28 rounded-full" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-full" />
      ))}
    </div>
  )
}
