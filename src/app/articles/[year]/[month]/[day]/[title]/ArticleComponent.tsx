"use client"

import { Article } from "@/types"
import Image from "next/image"
import { EyeIcon, ClockIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import RelatedArticles from "@/components/RelatedArticles"
import { useEffect } from "react"
import { useTrackView } from "@/hooks/useTrackView"
import AudioPlayer from "@/components/AudioPlayer"

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

function formatArticleBody(body: string) {
  return body
    .replace(/\[bold\](.*?)\[\/bold\]/g, "<strong>$1</strong>")
    .replace(/\[italic\](.*?)\[\/italic\]/g, "<em>$1</em>")
    .replace(
      /\[bold-italic\](.*?)\[\/bold-italic\]/g,
      "<strong><em>$1</em></strong>"
    )
    .replace(
      /\[underline-italic\](.*?)\[\/underline-italic\]/g,
      "<u><em>$1</em></u>"
    )
    .replace(
      /\[bold-underline\](.*?)\[\/bold-underline\]/g,
      "<u><strong>$1</strong></u>"
    )
    .replace(/\[strikethrough\](.*?)\[\/strikethrough\]/g, "<del>$1</del>")
    .replace(/\[p\]/g, "</p><p>")
    .split("</p><p>")
    .map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph.includes("<") ? (
          <span dangerouslySetInnerHTML={{ __html: paragraph }} />
        ) : (
          paragraph
        )}
      </p>
    ))
}

export default function ArticleComponent({
  article,
  relatedArticles,
}: {
  article: Article
  relatedArticles: Article[]
}) {
  const { mutate: trackView } = useTrackView()

  useEffect(() => {
    // Track view when component mounts
    trackView(article.id)
  }, [article.id, trackView])

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: process.env.NEXT_PUBLIC_BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: article?.category?.name || "Articles",
        item: article?.categoryId
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${article.categoryId}`
          : `${process.env.NEXT_PUBLIC_BASE_URL}/articles`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article?.title || "",
        item: `${process.env.NEXT_PUBLIC_BASE_URL}/articles/${article?.id}`,
      },
    ],
  }

  if (!article) return null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <nav className="max-w-4xl mx-auto px-4 py-4 text-sm">
        <Link href="/">Home</Link> {" / "}
        {article.category && (
          <>
            <Link href={`/categories/${article.categoryId}`}>
              {article.category.name}
            </Link>
            {" / "}
          </>
        )}
        <span>{article.title}</span>
      </nav>
      <article
        className="max-w-4xl mx-auto"
        itemScope
        itemType="https://schema.org/Article"
      >
        <div className="relative w-full h-[400px] mb-8">
          <Image
            src={article.imageUrl || ""}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            className="object-cover"
          />
        </div>

        <div className="px-4">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

          {article.audioUrl && <AudioPlayer audioUrl={article.audioUrl} />}

          <div className="flex items-center gap-6 text-sm text-foreground/60 mb-8">
            {article.category && (
              <span className="bg-foreground/10 px-3 py-1.5 rounded-full">
                {article.category.name}
              </span>
            )}
            <div className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              {article.views} views
            </div>
            <time>{new Date(article.createdAt).toLocaleDateString()}</time>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              {estimateReadingTime(article.body)} min read
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            {formatArticleBody(article.body)}
          </div>
        </div>

        <RelatedArticles articles={relatedArticles} />
      </article>
    </>
  )
}
