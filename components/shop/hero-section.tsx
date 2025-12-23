"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { OptimizedHeroVideo } from "@/components/ui/OptimizedHeroVideo"

type HeroSectionProps = {
  title?: string
  subtitle?: string
}

export function HeroSection({ title, subtitle }: HeroSectionProps) {
  const heroTitle = title || "Premium Instant Coffee Delivered Fresh"
  const heroSubtitle =
    subtitle ||
    "Experience the rich, bold flavor of freshly brewed coffee in convenient instant form. Perfectly freeze-dried to preserve every note and aroma."

  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <OptimizedHeroVideo
          posterSrc="/hero.png"
          posterAlt="mernin' dashboard preview"
          webmSrc={process.env.NEXT_PUBLIC_HERO_VIDEO_WEBM_URL}
          mp4Src={process.env.NEXT_PUBLIC_HERO_VIDEO_MP4_URL}
          priorityPoster
          className="h-full w-full border-0 rounded-none"
          fill
          useAspectRatio={false}
        />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-balance font-hero text-5xl tracking-wide uppercase text-white sm:text-6xl lg:text-7xl">
          {heroTitle}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-white/80 sm:text-xl">{heroSubtitle}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="min-w-40 uppercase">
            <Link href="/#products">
              Shop Coffee
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="min-w-40 bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            <Link href="/instant-processing">For Roasters</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
