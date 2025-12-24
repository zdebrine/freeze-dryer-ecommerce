"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { OptimizedHeroVideo } from "@/components/ui/OptimizedHeroVideo"

type CTA = { label: string; href: string; variant?: "primary" | "secondary" | "outline" | "ghost" }
type HeroConfig = {
  backgroundType?: "video" | "image"
  videoMp4?: string
  videoWebm?: string
  posterUrl?: string
  backgroundImageUrl?: string
  overlayColor?: string
  overlayOpacity?: number
  headlineMode?: "text" | "image"
  headline?: string
  headlineImageUrl?: string
  subheadline?: string
  ctas?: CTA[]
}

function buttonVariant(v?: CTA["variant"]) {
  // map to your existing Button variants
  if (v === "outline") return "outline"
  if (v === "ghost") return "ghost"
  return "default"
}

export function HeroSection({ config }: { config?: HeroConfig }) {
  const overlayOpacity = typeof config?.overlayOpacity === "number" ? config.overlayOpacity : 0.6
  const overlayColor = config?.overlayColor ?? "#000000"

  const ctas = config?.ctas ?? [
    { label: "Shop Coffee", href: "/#products", variant: "primary" },
    { label: "For Roasters", href: "/instant-processing", variant: "outline" },
  ]

  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {config?.backgroundType === "image" && config?.backgroundImageUrl ? (
          <Image
            src={config.backgroundImageUrl}
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <OptimizedHeroVideo
            posterSrc={config?.posterUrl ?? "/hero.png"}
            posterAlt="mernin' hero"
            webmSrc={config?.videoWebm}
            mp4Src={config?.videoMp4}
            priorityPoster
            className="h-full w-full border-0 rounded-none"
            fill
            useAspectRatio={false}
          />
        )}
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-5xl px-4 py-20 text-center">
        {config?.headlineMode === "image" && config?.headlineImageUrl ? (
          <div className="mx-auto mb-6 max-w-[720px]">
            <Image
              src={config.headlineImageUrl}
              alt="Hero headline"
              width={1400}
              height={400}
              className="h-auto w-full"
              priority
            />
          </div>
        ) : (
          <h1 className="text-balance font-hero text-5xl tracking-wide uppercase text-white sm:text-6xl lg:text-7xl">
            {config?.headline ?? "Premium Instant Coffee Delivered Fresh"}
          </h1>
        )}

        {config?.subheadline && (
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-white/80 sm:text-xl">
            {config.subheadline}
          </p>
        )}

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {ctas.map((cta, idx) => (
            <Button
              key={`${cta.href}-${idx}`}
              asChild
              size="lg"
              variant={buttonVariant(cta.variant) as any}
              className={
                cta.variant === "outline"
                  ? "min-w-40 bg-white/10 text-white hover:bg-white/20 border-white/20"
                  : "min-w-40 uppercase"
              }
            >
              <Link href={cta.href}>
                {cta.label}
                {idx === 0 && <ArrowRight className="ml-2 h-4 w-4" />}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  )
}
