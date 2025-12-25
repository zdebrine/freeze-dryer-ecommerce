"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { OptimizedHeroVideo } from "@/components/ui/OptimizedHeroVideo"

type CTA = { label: string; href: string; variant?: "primary" | "secondary" | "outline" | "ghost" }
type HeroConfig = {
  backgroundType?: "video" | "image"
  videoMp4?: string
  videoWebm?: string
  posterUrl?: string
  backgroundImageUrl?: string
  overlayOpacity?: number
  headlineMode?: "text" | "image"
  headline?: string
  headlineImageUrl?: string
  subheadline?: string
  ctas?: CTA[]
}

function buttonVariant(v?: CTA["variant"]) {
  if (v === "outline") return "outline"
  if (v === "ghost") return "ghost"
  // treat "secondary" as default unless you actually have a Button variant for it
  return "default"
}

function isExternalUrl(href: string) {
  return /^https?:\/\//i.test(href)
}

export function HeroSection({ config }: { config?: HeroConfig }) {

  const backgroundType = config?.backgroundType ?? "video"

  const mp4Src =
    config?.videoMp4 || process.env.NEXT_PUBLIC_HERO_VIDEO_MP4_URL || undefined
  const webmSrc =
    config?.videoWebm || process.env.NEXT_PUBLIC_HERO_VIDEO_WEBM_URL || undefined
  const posterSrc = config?.posterUrl || "/hero.png"

  const overlayOpacity = typeof config?.overlayOpacity === "number" ? config.overlayOpacity : 0.6

  const headlineMode = config?.headlineMode ?? "text"
  const headlineText = config?.headline ?? "Premium Instant Coffee Delivered Fresh"
  const subheadline =
    config?.subheadline ??
    "Experience the rich, bold flavor of freshly brewed coffee in convenient instant form. Perfectly freeze-dried to preserve every note and aroma."

  const ctas =
    config?.ctas?.length
      ? config.ctas
      : [
          { label: "Shop Coffee", href: "/#products", variant: "primary" },
          { label: "For Roasters", href: "/instant-processing", variant: "outline" },
        ]

  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {backgroundType === "image" ? (
          <div className="relative h-full w-full">
            {config?.backgroundImageUrl ? (
              <Image
                src={config.backgroundImageUrl}
                alt="Hero background"
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div className="h-full w-full bg-black" />
            )}
          </div>
        ) : (
          <OptimizedHeroVideo
            posterSrc={posterSrc}
            posterAlt="mernin' hero"
            webmSrc={webmSrc}
            mp4Src={mp4Src}
            priorityPoster
            className="h-full w-full border-0 rounded-none"
            fill
            useAspectRatio={false}
          />
        )}
      </div>

      {/* Overlay (black handled in CSS; opacity from Sanity) */}
      <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto max-w-5xl px-4 py-20 text-center">
        {headlineMode === "image" && config?.headlineImageUrl ? (
          <div className="mx-auto mb-6 w-full max-w-3xl">
            <Image
              src={config.headlineImageUrl}
              alt="Hero headline"
              width={1600}
              height={600}
              priority
              className="h-auto w-full"
              sizes="(max-width: 768px) 90vw, 800px"
            />
          </div>
        ) : (
          <h1 className="text-balance font-hero text-5xl tracking-wide uppercase text-white sm:text-6xl lg:text-7xl">
            {headlineText}
          </h1>
        )}

        {subheadline ? (
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-white/80 sm:text-xl">
            {subheadline}
          </p>
        ) : null}

        {ctas.length ? (
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {ctas.map((cta, idx) => {
              const variant = buttonVariant(cta.variant)
              const isPrimary = cta.variant === "primary" || !cta.variant
              const needsArrow = idx === 0 && isPrimary

              const linkProps = isExternalUrl(cta.href)
                ? { href: cta.href, target: "_blank", rel: "noreferrer" }
                : { href: cta.href }

              return (
                <Button
                  key={`${cta.label}-${cta.href}-${idx}`}
                  asChild
                  size="lg"
                  variant={variant as any}
                  className={
                    variant === "outline"
                      ? "min-w-70 text-lg font-calsans bg-white/10 text-white hover:bg-white/20 border-white/20"
                      : "min-w-70 text-lg font-calsans uppercase"
                  }
                >
                  <Link {...(linkProps as any)}>
                    {cta.label}
                    {needsArrow ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
                  </Link>
                </Button>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}
