import { Skeleton } from "@/components/ui/skeleton"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"

export default function SkeletonStoryList() {
  const { lg, md, sm } = useMediaQuery()

  return (
    <div className="grid gap-6 mt-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 items-start p-4 rounded-lg">
          <Skeleton
            className={cn(
              "relative flex-shrink-0 rounded-lg",
              lg
                ? "w-40 h-40"
                : md
                ? "w-32 h-32"
                : sm
                ? "w-24 h-24"
                : "w-20 h-20"
            )}
          />
          <div className="flex-1 space-y-3">
            <Skeleton
              className={cn(
                "rounded-lg",
                lg
                  ? "h-7 w-1/2"
                  : md
                  ? "h-7 w-1/2"
                  : sm
                  ? "h-6 w-1/2"
                  : "h-5 w-1/2"
              )}
            />
            <div className="flex items-center gap-4">
              <Skeleton
                className={cn(
                  "rounded-full",
                  lg ? "h-6 w-20" : md ? "h-5 w-16" : "h-4 w-14"
                )}
              />
              <Skeleton
                className={cn(
                  "rounded-lg",
                  lg ? "h-6 w-24" : md ? "h-5 w-20" : "h-4 w-16"
                )}
              />
              <Skeleton
                className={cn(
                  "rounded-lg",
                  lg ? "h-6 w-32" : md ? "h-5 w-28" : "h-4 w-24"
                )}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
