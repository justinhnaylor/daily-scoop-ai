"use client"

import { useState, useEffect, TouchEvent, MouseEvent } from "react"
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
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState(0)
  const [currentTranslate, setCurrentTranslate] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const handleDragStart = (e: TouchEvent | MouseEvent) => {
    setIsDragging(true)
    setIsPaused(true)
    const pos = "touches" in e ? e.touches[0].clientX : e.clientX
    setStartPos(pos)
  }

  const handleDragMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging) return
    const currentPosition = "touches" in e ? e.touches[0].clientX : e.clientX
    const diff = currentPosition - startPos
    const translate = currentIndex * -100 + (diff / window.innerWidth) * 100
    setCurrentTranslate(
      Math.max(Math.min(translate, 0), -((stories.length - 1) * 100))
    )
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const moveThreshold = 20
    const diff = currentTranslate + currentIndex * 100

    if (Math.abs(diff) > moveThreshold) {
      if (diff > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      } else if (diff < 0 && currentIndex < stories.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    }

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
    <div className="relative overflow-hidden h-[400px] w-full">
      <div
        className={`flex h-full ${
          !isDragging ? "transition-transform duration-500 ease-in-out" : ""
        }`}
        style={{
          transform: `translateX(${
            isDragging ? currentTranslate : -(currentIndex * 100)
          }%)`,
        }}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
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

      {/* Pagination dots */}
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
