"use client"

import type React from "react"

import { useState, useRef, useEffect, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CarouselProps = {
  children: ReactNode[]
  visibleItems?: number
  mobileVisibleItems?: number
  gap?: number
  className?: string
}

export function Carousel({ children, visibleItems = 4, mobileVisibleItems = 2, gap = 16, className }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const effectiveVisibleItems = isMobile ? mobileVisibleItems : visibleItems
  const totalItems = children.length
  const canScrollLeft = currentIndex > 0
  const canScrollRight = currentIndex < totalItems - effectiveVisibleItems

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const scrollToPrevious = () => {
    if (canScrollLeft) {
      setCurrentIndex((prev) => Math.max(0, prev - 1))
    }
  }

  const scrollToNext = () => {
    if (canScrollRight) {
      setCurrentIndex((prev) => Math.min(totalItems - effectiveVisibleItems, prev + 1))
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - containerRef.current.offsetLeft)
    setScrollLeft(containerRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startX) * 2
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return
    setStartX(e.touches[0].pageX)
    setScrollLeft(containerRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return
    const x = e.touches[0].pageX
    const walk = (startX - x) * 2
    containerRef.current.scrollLeft = scrollLeft + walk
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!containerRef.current) return
    const movedBy = containerRef.current.scrollLeft - scrollLeft
    const threshold = 50

    if (movedBy > threshold && canScrollRight) {
      scrollToNext()
    } else if (movedBy < -threshold && canScrollLeft) {
      scrollToPrevious()
    }
  }

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const itemWidth = container.scrollWidth / totalItems
    const scrollTo = currentIndex * itemWidth
    container.scrollTo({ left: scrollTo, behavior: "smooth" })
  }, [currentIndex, totalItems])

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className="scrollbar-hide overflow-x-auto"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div
          className="flex pb-4"
          style={{
            gap: `${gap}px`,
          }}
        >
          {children.map((child, index) => (
            <div
              key={index}
              style={{
                minWidth: `calc((100% - ${gap * (effectiveVisibleItems - 1)}px) / ${effectiveVisibleItems})`,
                maxWidth: `calc((100% - ${gap * (effectiveVisibleItems - 1)}px) / ${effectiveVisibleItems})`,
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {totalItems > effectiveVisibleItems && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute left-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-background/90 shadow-lg backdrop-blur transition-opacity",
              !canScrollLeft && "pointer-events-none opacity-0",
            )}
            onClick={scrollToPrevious}
            disabled={!canScrollLeft}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-background/90 shadow-lg backdrop-blur transition-opacity",
              !canScrollRight && "pointer-events-none opacity-0",
            )}
            onClick={scrollToNext}
            disabled={!canScrollRight}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}
    </div>
  )
}
