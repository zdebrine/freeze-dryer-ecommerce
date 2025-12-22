import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import type { ShopifyProduct } from "@/lib/shopify/storefront"

type ProductOfTheMonthProps = {
  products: ShopifyProduct[]
}

export function ProductOfTheMonth({ products }: ProductOfTheMonthProps) {
  // Use the first product as featured, or return null if no products
  const featuredProduct = products[0]

  if (!featuredProduct) {
    return null // Don't render this section if no products available
  }

  const image = featuredProduct.images.edges[0]?.node
  const price = featuredProduct.priceRange.minVariantPrice

  return (
    <section className="border-t bg-background px-4 py-20">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4">
            Featured
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Product of the Month</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            {image ? (
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.altText || featuredProduct.title}
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
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">{featuredProduct.title}</h3>
            <p className="text-lg text-muted-foreground">
              {featuredProduct.description ||
                "Experience our carefully crafted instant coffee, freeze-dried to preserve the rich flavors and aromas of freshly brewed coffee."}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">${Number.parseFloat(price.amount).toFixed(2)}</span>
              <span className="text-muted-foreground">{price.currencyCode}</span>
            </div>
            <Button asChild size="lg" className="text-lg">
              <Link href={`/products/${featuredProduct.handle}`}>
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
