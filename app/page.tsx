"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Package, Users, Zap } from "lucide-react"
import { OptimizedHeroVideo } from "@/components/ui/OptimizedHeroVideo"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-background border-b" : "bg-transparent border-b border-white/10"
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Package className={`h-6 w-6 transition-colors ${isScrolled ? "text-primary" : "text-white"}`} />
            <span className={`text-xl font-bold transition-colors ${isScrolled ? "" : "text-white"}`}>Coracle</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant={isScrolled ? "ghost" : "ghost"}
              className={isScrolled ? "" : "text-white hover:text-white hover:bg-white/10"}
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild className={isScrolled ? "" : "bg-white text-black hover:bg-white/90"}>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section (Full-screen background video) */}
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <OptimizedHeroVideo
            posterSrc="/hero.png"
            posterAlt="Coracle dashboard preview"
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
            Launch your own
            <span className="text-white underline"> Instant Coffee line</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-white/80 sm:text-xl">
            We turn your coffee into shelf-stable instant packets, so you can sell online, in-shop, and wholesale
            without buying new equipment.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="min-w-40 uppercase">
              <Link href="/auth/signup">
                Start a Batch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {/* <Button asChild size="lg" variant="outline" className="min-w-40 bg-transparent text-white hover:text-white">
              <Link href="/auth/login">Login</Link>
            </Button> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-background px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Launch an Instant SKU</h3>
              <p className="text-muted-foreground">
                Turn your current roast into instant coffee your customers can take anywhere. Choose a batch, ship
                coffee, and we handle the rest.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Your Brand, Not Ours</h3>
              <p className="text-muted-foreground">
                Sell it under your label with a simple approval flow. We keep production organized so you stay focused
                on roasting and retail.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Sell Everywhere</h3>
              <p className="text-muted-foreground">
                Perfect for online orders, in-shop shelves, travel packs, and wholesale. Track your batch status and get
                updates from intake to ship-out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Coracle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
