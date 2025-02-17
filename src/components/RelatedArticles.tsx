"use client"

import { Article } from "@/types"
import Link from "next/link"
import Image from "next/image"
import { EyeIcon } from "@heroicons/react/24/outline"

const DEFAULT_THUMBNAIL =
  "https://dymrplcuovidgyepquba.supabase.co/storage/v1/object/public/images//d_news_thumbnail.webp"

export default function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {articles.map((related: Article) => (
          <Link
            key={related?.id}
            href={`/articles/${related?.createdAt.getFullYear()}/${
              related?.createdAt.getMonth() + 1
            }/${related?.createdAt.getDate()}/${related.urlTitle}`}
            className="group"
          >
            <div className="relative w-full h-48 mb-4">
              <Image
                src={
                  related.thumbnailUrl || related.imageUrl || DEFAULT_THUMBNAIL
                }
                alt={related.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                className="object-cover rounded-lg group-hover:opacity-90 transition-opacity"
              />
            </div>
            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
              {related.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-foreground/60">
              {related.category && (
                <span className="bg-foreground/10 px-2 py-1 rounded-full">
                  {related.category.name}
                </span>
              )}
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                {related.views} views
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
