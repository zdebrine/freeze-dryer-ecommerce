"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"


type OptimizedHeroVideoProps = {
    posterSrc: string
    posterAlt: string
    webmSrc?: string
    mp4Src?: string
    className?: string
    priorityPoster?: boolean
    rootMargin?: string
    fill?: boolean
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

    React.useEffect(() => {
        if (typeof window === "undefined") return
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        if (mediaQuery.matches) setCanShowVideo(false)

        const handler = () => setCanShowVideo(!mediaQuery.matches)
        mediaQuery.addEventListener ?.("change", handler)
    return () => mediaQuery.removeEventListener ?.("change", handler)
  }, [])

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

    React.useEffect(() => {
        const el = videoRef.current
        if (!el || !canShowVideo || !shouldLoadVideo) return

        const tryPlay = async () => {
            try {
                el.load()
                await el.play()
            } catch {
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
                `${useAspectRatio && "aspect-ratio"}`,
                className
            )}
        >
            <Image
                src={posterSrc}
                alt={posterAlt}
                fill
                priority={priorityPoster}
                className={cn("object-cover", fill ? "object-cover" : "object-contain")}
                sizes="(max-width: 768px) 100vw, 960px"
            />
            {showVideoEl ? (
                <video
                    ref={videoRef}
                    className={cn("absolute inset-0 h-full w-full", fill ? "object-cover" : "object-contain")}
                    muted
                    playsInline
                    loop
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

            {children ? <div className="absolute inset-0">{children}</div> : null}
        </div>
    )
}
