"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

type Logo = {
  url: string
  alt: string
}

type LogoMarqueeConfig = {
  logos?: Logo[]
}

export function LogoMarquee({ config }: { config?: LogoMarqueeConfig }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let scrollPosition = 0
    const scrollSpeed = 0.5

    const animate = () => {
      scrollPosition += scrollSpeed
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0
      }
      scrollContainer.scrollLeft = scrollPosition
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  const logos = config?.logos || []

  if (logos.length === 0) {
    return null
  }

  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos]

  return (
    <section className="py-12">
      <div className="overflow-hidden">
        <div ref={scrollRef} className="flex gap-12 overflow-x-hidden" style={{ scrollBehavior: "auto" }}>
          {duplicatedLogos.map((logo, idx) => (
            <div
              key={`logo-${idx}`}
              className="relative h-12 w-32 flex-shrink-0 grayscale opacity-60 transition-opacity hover:opacity-100 hover:grayscale-0"
            >
              <Image
                src={logo.url || "/placeholder.svg"}
                alt={logo.alt || "Partner logo"}
                fill
                className="object-contain"
                sizes="128px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
