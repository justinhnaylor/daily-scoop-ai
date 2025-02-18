"use client"

import { EyeIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { Article } from "@/types"
import { useTheme } from "next-themes"

export default function StoryList({ stories }: { stories: Article[] }) {
  const { theme } = useTheme()

  return (
    <div className="grid gap-6 mt-6">
      {stories.map((story) => {
        const defaultThumb =
          story.defaultImages?.thumbnail?.[theme as "light" | "dark"] ||
          story.defaultImages?.thumbnail?.light
        const imageUrl = story.useImage ? story.thumbnailUrl : defaultThumb

        return (
          <Link
            key={story.id}
            href={`/articles/${story.createdAt.getFullYear()}/${
              story.createdAt.getMonth() + 1
            }/${story.createdAt.getDate()}/${story.urlTitle}`}
            className="flex gap-4 items-start hover:bg-foreground/5 p-4 rounded-lg transition-colors"
          >
            <div className="relative w-32 h-32 flex-shrink-0">
              <Image
                src={imageUrl || defaultThumb || ""}
                alt={story.title}
                fill
                sizes="(max-width: 768px) 96px, 128px"
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
              <div className="flex items-center gap-4 text-sm text-foreground/60">
                {story.category && (
                  <span className="bg-foreground/10 px-2 py-1 rounded-full">
                    {story.category.name}
                  </span>
                )}
                <div className="flex items-center">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  {story.views} views
                </div>
                <time>{new Date(story.createdAt).toLocaleDateString()}</time>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
