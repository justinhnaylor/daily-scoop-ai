"use client"

import { useState, useEffect } from "react"
import { EyeIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"

interface TrendingStory {
  id: string
  title: string
  imageUrl?: string | null
  views: number
  createdAt: Date
  urlTitle: string
  useImage: boolean
  defaultImages?: {
    banner: {
      light: string
      dark: string
    }
    thumbnail: {
      light: string
      dark: string
    }
  }
}

export default function TrendingCarousel({
  stories,
}: {
  stories: TrendingStory[]
}) {
  const { theme } = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const handlePrevious = () => {
    setCurrentIndex((current) =>
      current === 0 ? stories.length - 1 : current - 1
    )
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 1000)
  }

  const handleNext = () => {
    setCurrentIndex((current) =>
      current === stories.length - 1 ? 0 : current + 1
    )
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 1000)
  }

  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setCurrentIndex((current) =>
        current === stories.length - 1 ? 0 : current + 1
      )
    }, 5000)
    return () => clearInterval(timer)
  }, [stories.length, isPaused])

  return (
    <div className="relative overflow-hidden h-[300px] sm:h-[400px] w-full group">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {stories.map((story) => {
          const defaultBanner =
            story.defaultImages?.banner?.[theme as "light" | "dark"] ||
            story.defaultImages?.banner?.light
          const imageUrl = story.useImage ? story.imageUrl : defaultBanner

          return (
            <Link
              key={story?.id}
              href={`/articles/${story?.createdAt.getFullYear()}/${
                story?.createdAt.getMonth() + 1
              }/${story?.createdAt.getDate()}/${story?.urlTitle}`}
              className="min-w-full h-full relative group/item"
            >
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={story?.title}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  fill
                  className="object-cover transition-all duration-500 brightness-[0.9] sm:brightness-100"
                  priority
                  draggable={false}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold line-clamp-3 mb-4">
                    {story.title}
                  </h2>
                  <div className="flex items-center text-white/90 text-sm sm:text-base mb-4 md:mb-0">
                    <EyeIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">
                      {story.views.toLocaleString()} views
                    </span>
                    <span className="mx-3">•</span>
                    <time className="text-white/90">
                      {new Date(story.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <button
        onClick={handlePrevious}
        className="absolute left-0 top-0 h-full w-[15%] flex items-center justify-start px-4 
        opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Previous slide"
      >
        <div className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="white"
            className="w-6 h-6 sm:w-8 sm:h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </div>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-0 top-0 h-full w-[15%] flex items-center justify-end px-4
        opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Next slide"
      >
        <div className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="white"
            className="w-6 h-6 sm:w-8 sm:h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
      </button>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {stories.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white w-8"
                : "bg-white/50 w-4 hover:bg-white/70"
            }`}
            onClick={() => {
              setCurrentIndex(index)
              setIsPaused(true)
              setTimeout(() => setIsPaused(false), 1000)
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
