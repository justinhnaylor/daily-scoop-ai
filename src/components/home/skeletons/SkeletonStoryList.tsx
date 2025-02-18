import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonStoryList() {
  return (
    <div className="grid gap-6 mt-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 items-start p-4 rounded-lg">
          <Skeleton className="relative w-32 h-32 flex-shrink-0 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-6 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
