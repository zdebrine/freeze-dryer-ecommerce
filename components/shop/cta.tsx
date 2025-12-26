"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type CtaConfig = {
  ctaText?: string
  ctaSubText?: string
  ctaImage?: string // expect a resolved URL from Sanity query (asset->url)
  ctaLink?: string
  ctaButtonLabel?: string // optional (nice to have)
  ctaImageAlt?: string // optional (nice to have)
}

function isExternalUrl(href: string) {
  return /^https?:\/\//i.test(href)
}

export function Cta({ config }: { config?: CtaConfig }) {
  const headline = config?.ctaText ?? "Leisure-Enhancing Coffee"
  const subText =
    config?.ctaSubText ?? "A wildly good daily drinker for people who want a better morning without the fuss."
  const href = config?.ctaLink ?? "/#products"
  const buttonLabel = config?.ctaButtonLabel ?? "Shop the collection"
  const imageUrl = config?.ctaImage
  const imageAlt = config?.ctaImageAlt ?? "CTA image"

  const linkProps = isExternalUrl(href) ? { href, target: "_blank", rel: "noreferrer" } : { href }

  return (
    <section className="px-4 py-12">
      <div className="container mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl border bg-primary">
          {/* subtle gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-400/60 via-primary-300/60 to-primary-200/60" />

          {/* content */}
          <div className="relative grid grid-cols-1 md:grid-cols-2">
            {/* left: copy + button */}
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center md:px-12 md:py-16">
              <h2 className="text-balance font-calsans font-bold text-4xl tracking-tight text-secondary drop-shadow-sm sm:text-5xl lg:text-5xl uppercase">
                {headline}
              </h2>

              <p className="mt-6 max-w-xl text-pretty text-sm text-white/80 sm:text-base">
                {subText}
              </p>

              <div className="mt-8">
                <Button
                  asChild
                  className="rounded-full bg-yellow-200 px-8 py-6 text-sm font-semibold uppercase text-black font-calsans tracking-wide hover:bg-yellow-200/90"
                >
                  <Link {...(linkProps as any)}>{buttonLabel}</Link>
                </Button>
              </div>
            </div>

            {/* right: image panel */}
            <div className="relative min-h-[240px] md:min-h-[420px]">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={false}
                />
              ) : (
                <div className="h-full w-full bg-black/10" />
              )}

              {/* optional soft vignette to match the look */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/10 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
