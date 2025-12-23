"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { VariantSelector } from "@/components/cart/variant-selector"
import { AddToCart } from "@/components/cart/add-to-cart"
import type { ShopifyProduct, ProductVariant } from "@/lib/shopify/storefront"

type ProductClientProps = {
  product: ShopifyProduct
}

export function ProductClient({ product }: ProductClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length === 1 ? product.variants[0] : null,
  )

  const mainImage = product.images.edges[0]?.node
  const currentPrice = selectedVariant?.price || product.priceRange.minVariantPrice

  return (
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
          <span className="text-4xl font-bold">${Number.parseFloat(currentPrice.amount).toFixed(2)}</span>
          <span className="text-muted-foreground">{currentPrice.currencyCode}</span>
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="text-lg text-muted-foreground">
            {product.description ||
              "Premium freeze-dried instant coffee crafted for convenience without compromising on taste."}
          </p>
        </div>

        <VariantSelector options={product.options} variants={product.variants} onVariantChange={setSelectedVariant} />

        <AddToCart variant={selectedVariant} productTitle={product.title} disabled={!product.availableForSale} />

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
  )
}
