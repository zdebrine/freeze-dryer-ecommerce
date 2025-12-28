import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Eye, Star } from "lucide-react"
import type { ShopifyProduct } from "@/lib/shopify/storefront"
import { Carousel } from "@/components/shop/carousel"

type ProductCarouselProps = {
  title?: string
  products: ShopifyProduct[]
  visibleItems?: number
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5" fill={i < filled ? "currentColor" : "none"} aria-hidden="true" />
        ))}
      </div>
      <span>({count} reviews)</span>
    </div>
  )
}

export function ProductCarousel({ title, products, visibleItems = 3 }: ProductCarouselProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="bg-background px-4 pb-12 md:px-8 md:pb-40">
      <div className="container mx-auto max-w-7xl">
        {title && (
          <h2 className="mb-6 text-2xl font-bold font-calsans uppercase underline md:mb-8 md:text-4xl">{title}</h2>
        )}

        <Carousel visibleItems={visibleItems} mobileVisibleItems={2} gap={16}>
          {products.map((product) => {
            const image = product.images.edges[0]?.node
            const price = product.priceRange.minVariantPrice
            const rating = (product as any).rating as number | undefined
            const reviewCount = (product as any).reviewCount as number | undefined

            return (
              <Card key={product.id} className="group border-0 bg-transparent shadow-none">
                <div className="relative">
                  <Link href={`/products/${product.handle}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-muted/15">
                      <div className="flex h-full w-full items-center justify-center">
                        {image ? (
                          <Image
                            src={image.url || "/placeholder.svg"}
                            alt={image.altText || product.title}
                            width={1200}
                            height={1200}
                            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            priority={false}
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground">No image</div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4">
                      {typeof rating === "number" && typeof reviewCount === "number" ? (
                        <StarRating rating={rating} count={reviewCount} />
                      ) : null}

                      <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{product.title}</h3>

                      <p className="mt-1 text-sm font-medium">${Number.parseFloat(price.amount).toFixed(2)}</p>
                    </div>
                  </Link>

                  <div className="pointer-events-none absolute bottom-4 right-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Link
                      href={`/products/${product.handle}`}
                      aria-label="Quick view"
                      className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-border backdrop-blur hover:bg-background"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </Carousel>
      </div>
    </section>
  )
}
