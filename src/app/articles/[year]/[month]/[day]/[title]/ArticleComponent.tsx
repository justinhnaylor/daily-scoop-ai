"use client"

import { Article, ProcessedArticle } from "@/types"
import Image from "next/image"
import { EyeIcon, ClockIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import RelatedArticles from "@/components/RelatedArticles"
import { useEffect } from "react"
import { useTrackView } from "@/hooks/useTrackView"
import AudioPlayer from "@/components/AudioPlayer"
import { useTheme } from "next-themes"
import ShareButton from "./ShareButton"

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
    { regex: /\*\*(.*?)\*\*/g, type: "bold" },
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
  article: ProcessedArticle
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
      <nav className="max-w-4xl mx-auto px-4 py-4 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-1">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>{" "}
          {" / "}
          {article.category && (
            <>
              <Link
                href={`/categories/${article.categoryId}`}
                className="hover:text-foreground transition-colors"
              >
                {article.category.name}
              </Link>
              {" / "}
            </>
          )}
          <span className="break-all text-foreground">{article.title}</span>
        </div>
      </nav>
      <article
        className="max-w-4xl mx-auto"
        itemScope
        itemType="https://schema.org/Article"
      >
        <div className="mb-8">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
            <Image
              src={imageUrl || defaultBanner || ""}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              className="object-cover rounded-lg shadow-lg"
            />
          </div>
          <p className="text-[10px] ml-4 text-muted-foreground mt-2 italic">
            Image and audio narration were created using AI.{" "}
            <Link
              href="/about"
              className="font-medium text-primary hover:underline transition-colors"
            >
              Learn more
            </Link>
          </p>
        </div>

        <div className="px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {article.title}
          </h1>

          {article.category && (
            <div className="mb-4">
              <span className="bg-muted/50 text-muted-foreground px-2.5 py-1 rounded-full text-xs sm:text-sm border border-muted/20 hover:bg-muted/70 transition-colors">
                {article.category.name}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm sm:text-base md:text-lg text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              {article.views.toLocaleString()}
            </div>
            <time className="flex items-center">
              {new Date(article.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              {estimateReadingTime(article.body)}m
            </div>
            <ShareButton url={article?.shareUrl} title={article?.title} />
          </div>

          {article.audioUrl && (
            <div className="mb-8">
              <AudioPlayer audioUrl={article.audioUrl} />
            </div>
          )}

          <div className="prose prose-lg md:prose-xl text-foreground/90 max-w-none prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground">
            {formatArticleBody(article.body)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-6 italic">
            This article was created using AI.{" "}
            <Link
              href="/about"
              className="font-medium text-primary hover:underline transition-colors"
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
