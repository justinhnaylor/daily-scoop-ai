"use client"

import { Article } from "@/types"
import Image from "next/image"
import { EyeIcon, ClockIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import RelatedArticles from "@/components/RelatedArticles"
import { useEffect } from "react"
import { useTrackView } from "@/hooks/useTrackView"
import AudioPlayer from "@/components/AudioPlayer"
import { useTheme } from "next-themes"

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

type TextSegment = {
  type:
    | "text"
    | "bold"
    | "italic"
    | "bold-italic"
    | "underline-italic"
    | "bold-underline"
    | "strikethrough"
  content: string
}

function parseTextSegments(text: string): TextSegment[] {
  const patterns: { regex: RegExp; type: TextSegment["type"] }[] = [
    { regex: /\[bold\](.*?)\[\/bold\]/g, type: "bold" },
    { regex: /\[italic\](.*?)\[\/italic\]/g, type: "italic" },
    { regex: /\[bold-italic\](.*?)\[\/bold-italic\]/g, type: "bold-italic" },
    {
      regex: /\[underline-italic\](.*?)\[\/underline-italic\]/g,
      type: "underline-italic",
    },
    {
      regex: /\[bold-underline\](.*?)\[\/bold-underline\]/g,
      type: "bold-underline",
    },
    {
      regex: /\[strikethrough\](.*?)\[\/strikethrough\]/g,
      type: "strikethrough",
    },
  ]

  let segments: TextSegment[] = [{ type: "text", content: text }]

  patterns.forEach(({ regex, type }) => {
    segments = segments.flatMap((segment) => {
      if (segment.type !== "text") return [segment]

      const parts: TextSegment[] = []
      let lastIndex = 0
      let match

      while ((match = regex.exec(segment.content)) !== null) {
        if (match.index > lastIndex) {
          parts.push({
            type: "text",
            content: segment.content.slice(lastIndex, match.index),
          })
        }
        parts.push({
          type,
          content: match[1],
        })
        lastIndex = match.index + match[0].length
      }

      if (lastIndex < segment.content.length) {
        parts.push({
          type: "text",
          content: segment.content.slice(lastIndex),
        })
      }

      return parts
    })
  })

  return segments
}

function TextSegment({ segment }: { segment: TextSegment }) {
  switch (segment.type) {
    case "bold":
      return (
        <strong className="font-bold text-foreground">{segment.content}</strong>
      )
    case "italic":
      return <em className="italic text-foreground">{segment.content}</em>
    case "bold-italic":
      return (
        <strong className="font-bold text-foreground">
          <em className="italic text-foreground">{segment.content}</em>
        </strong>
      )
    case "underline-italic":
      return (
        <u className="underline text-foreground">
          <em className="italic text-foreground">{segment.content}</em>
        </u>
      )
    case "bold-underline":
      return (
        <u className="underline text-foreground">
          <strong className="text-foreground">{segment.content}</strong>
        </u>
      )
    case "strikethrough":
      return (
        <del className="line-through text-foreground">{segment.content}</del>
      )
    default:
      return <>{segment.content}</>
  }
}

function formatArticleBody(body: string) {
  return body.split("[p]").map((paragraph, index) => {
    const segments = parseTextSegments(paragraph)
    return (
      <p key={index} className="mb-4">
        {segments.map((segment, i) => (
          <TextSegment key={i} segment={segment} />
        ))}
      </p>
    )
  })
}

export default function ArticleComponent({
  article,
  relatedArticles,
}: {
  article: Article
  relatedArticles: Article[]
}) {
  const { theme } = useTheme()
  const { mutate: trackView } = useTrackView()

  const defaultBanner =
    article.defaultImages?.banner?.[theme as "light" | "dark"] ||
    article.defaultImages?.banner?.light

  const imageUrl = article.useImage ? article.imageUrl : defaultBanner

  useEffect(() => {
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
        <div className="mb-8">
          <div className="relative w-full h-[400px]">
            <Image
              src={imageUrl || defaultBanner || ""}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-cover"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            Image and audio narration were created using AI.{" "}
            <Link
              href="/about"
              className="font-bold underline text-[10px] text-primary hover:underline"
            >
              Learn more
            </Link>
          </p>
        </div>

        <div className="px-4">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

          {article.audioUrl && (
            <div className="my-6 max-w-2xl">
              <AudioPlayer audioUrl={article.audioUrl} />
            </div>
          )}

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

          <div className="prose prose-lg text-foreground/90 max-w-none">
            {formatArticleBody(article.body)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            This article was created using AI.{" "}
            <Link
              href="/about"
              className="font-bold underline text-[10px] text-primary hover:underline"
            >
              Learn more
            </Link>
          </p>
        </div>

        <RelatedArticles articles={relatedArticles} />
      </article>
    </>
  )
}
