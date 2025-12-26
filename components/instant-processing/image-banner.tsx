import Image from "next/image"

type ImageBannerConfig = {
  imageUrl?: string
  overlayText?: string
  textPosition?: string
}

function getPositionClasses(position?: string) {
  switch (position) {
    case "top-left":
      return "top-8 left-8 items-start text-left"
    case "top-center":
      return "top-8 left-1/2 -translate-x-1/2 items-center text-center"
    case "top-right":
      return "top-8 right-8 items-end text-right"
    case "center-left":
      return "top-1/2 -translate-y-1/2 left-8 items-start text-left"
    case "center":
      return "top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 items-center text-center"
    case "center-right":
      return "top-1/2 -translate-y-1/2 right-8 items-end text-right"
    case "bottom-left":
      return "bottom-8 left-8 items-start text-left"
    case "bottom-center":
      return "bottom-8 left-1/2 -translate-x-1/2 items-center text-center"
    case "bottom-right":
      return "bottom-8 right-8 items-end text-right"
    default:
      return "top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 items-center text-center"
  }
}

export function ImageBanner({ config }: { config?: ImageBannerConfig }) {
  const imageUrl = config?.imageUrl
  const overlayText = config?.overlayText || "Crafted with precision, delivered with care"
  const textPosition = config?.textPosition || "center"

  if (!imageUrl) {
    return null
  }

  return (
    <section className="relative h-[400px] md:h-[500px] overflow-hidden">
      <Image
        src={imageUrl || "/placeholder.svg"}
        alt="Banner"
        fill
        className="object-cover"
        sizes="100vw"
        priority={false}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className={`absolute flex flex-col ${getPositionClasses(textPosition)}`}>
        <h2 className="text-balance font-hero text-4xl tracking-wide uppercase text-white sm:text-5xl lg:text-6xl max-w-4xl px-4">
          {overlayText}
        </h2>
      </div>
    </section>
  )
}
