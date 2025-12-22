import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import type { ShopifyProduct } from "@/lib/shopify/storefront"

type ProductGridProps = {
  products: ShopifyProduct[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Package className="h-16 w-16 text-muted-foreground/50" />
          <div>
            <p className="text-lg font-semibold text-muted-foreground mb-2">No products available</p>
            <p className="text-sm text-muted-foreground">
              Shopify integration is not configured yet. Please check your environment variables.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const image = product.images.edges[0]?.node
        const price = product.priceRange.minVariantPrice

        return (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
            <Link href={`/products/${product.handle}`}>
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {image ? (
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={image.altText || product.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2 p-4">
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <p className="text-lg font-bold">
                  ${Number.parseFloat(price.amount).toFixed(2)} {price.currencyCode}
                </p>
                <Button className="w-full mt-2" size="sm">
                  View Product
                </Button>
              </CardFooter>
            </Link>
          </Card>
        )
      })}
    </div>
  )
}
