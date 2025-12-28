import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import type { ShopifyProduct } from "@/lib/shopify/storefront"

type Config = {
  badgeText?: string
  title?: string
  descriptionOverride?: string
  buttonText?: string
}

export function ProductOfTheMonth({ product, config }: { product: ShopifyProduct | null; config?: Config }) {
  
  if (!product) return null

  const image = product.images.edges[0]?.node
  const price = product.priceRange.minVariantPrice

  return (
    <section className="border-t bg-background px-4 py-20">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold font-calsans uppercase sm:text-5xl">
            {config?.title ?? "Product of the Month"}
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {image ? (
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.altText || product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl font-bold font-calsans uppercase sm:text-4xl">{product.title}</h3>
            <p className="text-lg text-muted-foreground">
              {config?.descriptionOverride || product.description || "Featured product description goes here."}
            </p>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">${Number.parseFloat(price.amount).toFixed(2)}</span>
              <span className="text-muted-foreground">{price.currencyCode}</span>
            </div>

            <Button asChild size="lg" className="text-lg">
              <Link href={`/products/${product.handle}`}>
                {config?.buttonText ?? "Shop Now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
