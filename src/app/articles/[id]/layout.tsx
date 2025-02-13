import { Article } from "@/types"
import Image from "next/image"
import { EyeIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

export default function ArticleLayout({ article }: { article: Article }) {
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
        name: article.category?.name || "Articles",
        item: `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${article.categoryId}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${process.env.NEXT_PUBLIC_BASE_URL}/articles/${article.id}`,
      },
    ],
  }

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
      <article className="max-w-4xl mx-auto">
        <div className="relative w-full h-[400px] mb-8">
          <Image
            src={article.imageUrl || ""}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="px-4">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

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
          </div>

          <div className="prose prose-lg max-w-none">{article.body}</div>
        </div>
      </article>
    </>
  )
}
