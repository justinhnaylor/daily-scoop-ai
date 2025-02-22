import { Skeleton } from "@/components/ui/skeleton"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"

export default function SkeletonStoryList() {
  const { lg, md, sm, xs } = useMediaQuery()

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
                  ? "h-7 w-5/6"
                  : sm
                  ? "h-6 w-5/6"
                  : "h-5 w-11/12"
              )}
            />
            {!lg && !md && !sm && !xs && (
              <Skeleton className={cn("rounded-lg", "h-5 w-2/12")} />
            )}
            <div className="flex items-center gap-4">
              <Skeleton
                className={cn(
                  "rounded-full",
                  lg ? "h-6 w-20" : md ? "h-5 w-16" : "h-4 w-16"
                )}
              />
              <Skeleton
                className={cn(
                  "rounded-lg",
                  lg ? "h-6 w-12" : md ? "h-5 w-10" : "h-4 w-8"
                )}
              />
              <Skeleton
                className={cn(
                  "rounded-lg",
                  lg ? "h-6 w-24" : md ? "h-5 w-18" : "h-4 w-16"
                )}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
