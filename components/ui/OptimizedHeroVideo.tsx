"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * OptimizedHeroVideo
 * - Shows an optimized Next.js <Image> poster immediately (great LCP).
 * - Defers adding <source> + starting playback until near viewport.
 * - Respects prefers-reduced-motion by never playing video.
 * - Falls back gracefully if autoplay fails or video errors.
 *
 * Put your assets in /public:
 * - /hero-poster.jpg (or .png)
 * - /hero.webm
 * - /hero.mp4
 */
type OptimizedHeroVideoProps = {
    posterSrc: string
    posterAlt: string
    webmSrc?: string
    mp4Src?: string
    className?: string
    priorityPoster?: boolean
    /** Start loading/playing slightly before it enters view */
    rootMargin?: string
    /** If true, video fills the container like a background */
    fill?: boolean
    /** Optional overlay content on top of the media */
    useAspectRatio: boolean;
    children?: React.ReactNode
}

export function OptimizedHeroVideo({
    posterSrc,
    posterAlt,
    webmSrc,
    mp4Src,
    className,
    priorityPoster = true,
    rootMargin = "200px",
    fill = true,
    useAspectRatio = true,
    children,
}: OptimizedHeroVideoProps) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null)

    const [shouldLoadVideo, setShouldLoadVideo] = React.useState(false)
    const [canShowVideo, setCanShowVideo] = React.useState(true)

    // Reduced motion: never load/play the video.
    React.useEffect(() => {
        if (typeof window === "undefined") return
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        if (mediaQuery.matches) setCanShowVideo(false)

        const handler = () => setCanShowVideo(!mediaQuery.matches)
        mediaQuery.addEventListener ?.("change", handler)
    return () => mediaQuery.removeEventListener ?.("change", handler)
  }, [])

    // Only start loading the video when near the viewport.
    React.useEffect(() => {
        const el = videoRef.current
        if (!el || !canShowVideo) return

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldLoadVideo(true)
                    obs.disconnect()
                }
            },
            { rootMargin }
        )

        obs.observe(el)
        return () => obs.disconnect()
    }, [canShowVideo, rootMargin])

    // Try to play once sources are mounted.
    React.useEffect(() => {
        const el = videoRef.current
        if (!el || !canShowVideo || !shouldLoadVideo) return

        const tryPlay = async () => {
            try {
                // On some browsers it helps to call load() before play() when sources are added dynamically
                el.load()
                await el.play()
            } catch {
                // Autoplay blocked or other issue — keep poster visible.
                setCanShowVideo(false)
            }
        }

        tryPlay()
    }, [canShowVideo, shouldLoadVideo])

    const showVideoEl = canShowVideo && (webmSrc || mp4Src)

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border bg-muted/30",
                // If you want a fixed aspect ratio by default (no CLS), keep aspect-video:
                `${useAspectRatio && "aspect-ratio"}`,
                className
            )}
        >
            {/* Poster always renders. It's the visual fallback and your LCP-friendly asset. */}
            <Image
                src={posterSrc}
                alt={posterAlt}
                fill
                priority={priorityPoster}
                className={cn("object-cover", fill ? "object-cover" : "object-contain")}
                sizes="(max-width: 768px) 100vw, 960px"
            />

            {/* Video overlays the poster when allowed. Poster remains underneath for seamless fallback. */}
            {showVideoEl ? (
                <video
                    ref={videoRef}
                    className={cn("absolute inset-0 h-full w-full", fill ? "object-cover" : "object-contain")}
                    muted
                    playsInline
                    loop
                    // Don't use autoPlay directly; we play() after intersection to avoid eager downloads.
                    preload="none"
                    poster={posterSrc}
                    onError={() => setCanShowVideo(false)}
                >
                    {shouldLoadVideo ? (
                        <>
                            {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
                            {mp4Src ? <source src={mp4Src} type="video/mp4" /> : null}
                        </>
                    ) : null}
                </video>
            ) : null}

            {/* Optional overlay content (labels, gradients, CTA, etc.) */}
            {children ? <div className="absolute inset-0">{children}</div> : null}
        </div>
    )
}

/**
 * Example usage:
 *
 * <OptimizedHeroVideo
 *   posterSrc="/hero-poster.jpg"
 *   posterAlt="mernin' dashboard preview"
 *   webmSrc="/hero.webm"
 *   mp4Src="/hero.mp4"
 *   className="mt-10"
 * />
 */
