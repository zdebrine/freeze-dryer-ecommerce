import Image from "next/image"
import Link from "next/link"

type ImageBannerProps = {
  imageUrl: string
  overlayText: string
  link: string
  textPosition?: string
}

export function ImageBanner({ imageUrl, overlayText, link, textPosition = "center" }: ImageBannerProps) {
  const positionClasses = {
    "top-left": "items-start justify-start",
    "top-center": "items-start justify-center",
    "top-right": "items-start justify-end",
    "center-left": "items-center justify-start",
    center: "items-center justify-center",
    "center-right": "items-center justify-end",
    "bottom-left": "items-end justify-start",
    "bottom-center": "items-end justify-center",
    "bottom-right": "items-end justify-end",
  }

  return (
    <section className="relative h-[400px] w-full overflow-hidden md:h-[500px]">
      <Link href={link} className="block h-full w-full">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={overlayText}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="100vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div
          className={`absolute inset-0 flex p-8 md:p-16 ${
            positionClasses[textPosition as keyof typeof positionClasses] || positionClasses.center
          }`}
        >
          <h2 className="max-w-2xl text-balance text-4xl font-bold text-white md:text-6xl">{overlayText}</h2>
        </div>
      </Link>
    </section>
  )
}
