import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShopHeader } from "@/components/shop/header"
import { ShopFooter } from "@/components/shop/footer"
import { getProduct, createCheckoutUrl } from "@/lib/shopify/storefront"
import { ShoppingCart } from "lucide-react"

type ProductPageProps = {
  params: Promise<{ handle: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  const mainImage = product.images.edges[0]?.node
  const price = product.priceRange.minVariantPrice
  const firstVariant = product.variants.edges[0]?.node

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />

      <main className="flex-1 pt-16">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {mainImage ? (
                  <Image
                    src={mainImage.url || "/placeholder.svg"}
                    alt={mainImage.altText || product.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-muted-foreground">No image available</span>
                  </div>
                )}
              </div>
              {product.images.edges.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.edges.slice(1, 5).map((edge, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={edge.node.url || "/placeholder.svg"}
                        alt={edge.node.altText || `${product.title} ${index + 2}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 12.5vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-4">
                  Instant Coffee
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{product.title}</h1>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">${Number.parseFloat(price.amount).toFixed(2)}</span>
                <span className="text-muted-foreground">{price.currencyCode}</span>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-lg text-muted-foreground">
                  {product.description ||
                    "Premium freeze-dried instant coffee crafted for convenience without compromising on taste."}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Features:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Freeze-dried to preserve flavor and aroma</li>
                  <li>✓ Quick and convenient preparation</li>
                  <li>✓ Perfect for travel, camping, or office</li>
                  <li>✓ Long shelf life with no refrigeration needed</li>
                  <li>✓ Made from premium coffee beans</li>
                </ul>
              </div>

              {firstVariant && (
                <Button asChild size="lg" className="w-full text-lg">
                  <a href={createCheckoutUrl(firstVariant.id)} target="_blank" rel="noopener noreferrer">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </a>
                </Button>
              )}

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-semibold mb-2">How to Prepare:</p>
                <ol className="space-y-1 text-muted-foreground">
                  <li>1. Add one packet to 8oz hot water</li>
                  <li>2. Stir until dissolved</li>
                  <li>3. Enjoy your perfect cup of coffee</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ShopFooter />
    </div>
  )
}
