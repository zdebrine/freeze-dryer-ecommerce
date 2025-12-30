// components/shop/ProductGrid.tsx
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Eye, Star } from "lucide-react"
import type { ShopifyProduct } from "@/lib/shopify/storefront"

type ProductGridProps = {
  products: ShopifyProduct[]
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  // simple 0–5 display (no half stars)
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

export function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No products available. Check your Shopify env vars / storefront connection.
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
      {products.map((product) => {
        const image = product.images.edges[0]?.node
        const price = product.priceRange.minVariantPrice

        // Optional: if you add ratings via metafields or an app, map them here.
        const rating = (product as any).rating as number | undefined
        const reviewCount = (product as any).reviewCount as number | undefined

        return (
          <Card key={product.id} className="group border-0 bg-transparent shadow-none">
            <div className="relative">
              {/* Main clickable area */}
              <Link href={`/products/${product.handle}`} className="block">
                {/* Big image stage with whitespace + object-contain */}
                <div className="relative aspect-square overflow-hidden bg-muted/15">
                  <div className="flex h-full w-full items-center justify-center">
                    {image ? (
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={image.altText || product.title}
                        width={1200}
                        height={1200}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        priority={false}
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">No image</div>
                    )}
                  </div>

                  {/* If you want a discount badge like the screenshot:
                      add compareAtPrice to your Shopify query, compute % off, and render a badge here. */}
                </div>

                {/* Text block under the image */}
                <div className="pt-4">
                  {typeof rating === "number" && typeof reviewCount === "number" ? (
                    <StarRating rating={rating} count={reviewCount} />
                  ) : null}

                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{product.title}</p>

                  <p className="mt-1 text-sm font-medium">${Number.parseFloat(price.amount).toFixed(2)}</p>
                </div>
              </Link>

              {/* Floating quick-action icons (separate from the main Link to avoid nested interactive elements) */}
              <div className="pointer-events-none absolute bottom-4 right-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Link
                  href={`/products/${product.handle}`}
                  aria-label="Quick view"
                  className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-border backdrop-blur hover:bg-background"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                {/* Add-to-cart icon could go here later (client action). Keeping one icon for now. */}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
