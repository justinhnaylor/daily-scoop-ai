import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonTrendingCarousel() {
  return (
    <div className="relative h-[400px] w-full">
      <div className="flex h-full">
        <div className="min-w-full h-full relative">
          <Skeleton className="w-full h-full rounded-lg" />
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
