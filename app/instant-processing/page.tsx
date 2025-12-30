import { client } from "@/cms/lib/client"
import { INSTANT_PROCESSING_QUERY, LANDING_PAGE_QUERY } from "@/cms/lib/queries"
import { ShopHeader } from "@/components/shop/header"
import { ShopFooter } from "@/components/shop/footer"
import { Cta } from "@/components/shop/cta"
import { OptimizedHeroVideo } from "@/components/ui/OptimizedHeroVideo"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LogoMarquee } from "@/components/instant-processing/logo-marquee"
import { ImageBanner } from "@/components/instant-processing/image-banner"
import { HowItWorks } from "@/components/instant-processing/how-it-works"

export const revalidate = 60

export default async function InstantProcessingPage() {
  // Fetch landing page data for header/footer
  const landing = await client.fetch(LANDING_PAGE_QUERY)

  // Fetch instant processing page data
  const instantProcessing = await client.fetch(INSTANT_PROCESSING_QUERY)

  const hero = instantProcessing?.hero
  const aboutSection = instantProcessing?.aboutSection
  const logoMarquee = instantProcessing?.logoMarquee
  const imageBanner = instantProcessing?.imageBanner
  const howItWorks = instantProcessing?.howItWorks
  const ctaSection = instantProcessing?.ctaSection

  // Hero defaults
  const mp4Src = hero?.videoMp4 || process.env.NEXT_PUBLIC_HERO_VIDEO_MP4_URL
  const webmSrc = hero?.videoWebm || process.env.NEXT_PUBLIC_HERO_VIDEO_WEBM_URL
  const posterSrc = hero?.posterUrl || "/hero.png"
  const overlayOpacity = typeof hero?.overlayOpacity === "number" ? hero.overlayOpacity : 0.6
  const headline = hero?.headline || "Launch your own Instant Coffee line"
  const subheadline =
    hero?.subheadline ||
    "We turn your coffee into shelf-stable instant packets, so you can sell online, in-shop, and wholesale without buying new equipment."
  const ctaLabel = hero?.ctaLabel || "Start a Batch"
  const ctaLink = hero?.ctaLink || "/auth/signup"

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader config={landing?.header} />

      <main>
        <section className="relative flex h-[80vh] items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <OptimizedHeroVideo
              posterSrc={posterSrc}
              posterAlt="Instant processing hero"
              webmSrc={webmSrc}
              mp4Src={mp4Src}
              priorityPoster
              className="h-full w-full border-0 rounded-none"
              fill
              useAspectRatio={false}
            />
          </div>
          <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
          <div className="relative z-10 container mx-auto max-w-5xl px-4 py-20 text-center">
            <h1 className="text-balance font-hero text-5xl tracking-wide uppercase text-secondary sm:text-6xl lg:text-7xl">
              {headline}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-white/80 sm:text-xl">{subheadline}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="min-w-40 uppercase">
                <Link href={ctaLink}>
                  {ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-background px-4 py-20">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold font-calsans uppercase sm:text-5xl">
              {aboutSection?.title || "What We're About"}
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              {aboutSection?.description ||
                "We're here to help coffee roasters expand their product lines with premium freeze-dried instant coffee. No equipment needed, just your great coffee and our expertise."}
            </p>
          </div>
        </section>

        <LogoMarquee config={logoMarquee} />

        <ImageBanner config={imageBanner} />

        <HowItWorks config={howItWorks} />

        <Cta config={ctaSection} />
      </main>

      <ShopFooter config={landing?.footer} />
    </div>
  )
}
