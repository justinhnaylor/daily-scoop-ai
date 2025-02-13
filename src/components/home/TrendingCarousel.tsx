"use client"

import { useState, useEffect } from "react"
import { EyeIcon } from "@heroicons/react/24/outline"
import Image from "next/image"

interface TrendingStory {
  id: string
  title: string
  imageUrl?: string | null
  views: number
}

export default function TrendingCarousel({
  stories,
}: {
  stories: TrendingStory[]
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((current) =>
        current === stories.length - 1 ? 0 : current + 1
      )
    }, 5000)
    return () => clearInterval(timer)
  }, [stories.length])

  return (
    <div className="relative overflow-hidden h-[400px] w-full">
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {stories.map((story) => (
          <div key={story.id} className="min-w-full h-full relative">
            {story.imageUrl && (
              <Image
                src={story.imageUrl}
                alt={story.title}
                fill
                className="object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-6">
              <h2 className="text-white text-2xl font-bold">{story.title}</h2>
              <div className="flex items-center text-white/80 mt-2">
                <EyeIcon className="h-5 w-5 mr-2" />
                <span>{story.views} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
