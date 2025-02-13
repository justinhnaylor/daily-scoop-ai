import { EyeIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { Article } from "@/types"

export default function StoryList({ stories }: { stories: Article[] }) {
  return (
    <div className="grid gap-6 mt-6">
      {stories.map((story) => (
        <Link
          key={story.id}
          href={`/articles/${story.id}`}
          className="flex gap-4 items-start hover:bg-foreground/5 p-4 rounded-lg transition-colors"
        >
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image
              src={story.thumbnailUrl || story.imageUrl || ""}
              alt={story.title}
              fill
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
      ))}
    </div>
  )
}
