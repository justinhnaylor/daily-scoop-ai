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
        className="flex h-full transition-transform duration-500 ease-in-out"
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
              className="min-w-full h-full relative"
            >
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={story?.title}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  fill
                  className="object-cover"
                  draggable={false}
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-6">
                <h2 className="text-white text-2xl font-bold">{story.title}</h2>
                <div className="flex items-center text-white/80 mt-2">
                  <EyeIcon className="h-5 w-5 mr-2" />
                  <span>{story.views} views</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div
        onClick={handlePrevious}
        className="absolute left-0 top-0 h-full w-[100px] bg-gradient-to-r from-black/0 
        hover:opacity-100 opacity-0 transition-opacity cursor-pointer hover:from-black/20"
      >
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-black/0 text-white/30 p-2 rounded-full"
          aria-label="Previous slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
      </div>

      <div
        onClick={handleNext}
        className="absolute right-0 top-0 h-full w-[100px] bg-gradient-to-l from-black/0 
        hover:opacity-100 opacity-0 transition-opacity cursor-pointer hover:from-black/20"
      >
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent hover:bg-black/0 text-white/30 p-2 rounded-full"
          aria-label="Next slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {stories.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-white w-4" : "bg-white/50"
            }`}
            onClick={() => {
              setCurrentIndex(index)
              setIsPaused(true)
              setTimeout(() => setIsPaused(false), 1000)
            }}
          />
        ))}
      </div>
    </div>
  )
}
