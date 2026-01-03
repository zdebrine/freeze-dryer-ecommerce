"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { VariantSelector } from "@/components/cart/variant-selector"
import { AddToCart } from "@/components/cart/add-to-cart"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ShopifyProduct, ProductVariant } from "@/lib/shopify/storefront"

type ProductClientProps = {
  product: ShopifyProduct
}

export function ProductClient({ product }: ProductClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length === 1 ? product.variants[0] : null,
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const images = product.images.edges
  const currentImage = images[selectedImageIndex] ?.node
  const currentPrice = selectedVariant ?.price || product.priceRange.minVariantPrice
  const priceTransparency = product ?.metafields ?.find(metafield => metafield ?.key === "price_transparency") || null;

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
    if (isRightSwipe && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
  }

  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
  }

  const handleNextImage = () => {
    if (selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4 md:sticky md:top-24 md:self-start">
          <div
            ref={imageContainerRef}
            className="relative aspect-square overflow-hidden rounded-lg bg-muted touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {currentImage ? (
              <Image
                src={currentImage.url || "/placeholder.svg"}
                alt={currentImage.altText || product.title}
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

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 md:hidden bg-background/80 hover:bg-background/90"
                  onClick={handlePrevImage}
                  disabled={selectedImageIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 md:hidden bg-background/80 hover:bg-background/90"
                  onClick={handleNextImage}
                  disabled={selectedImageIndex === images.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 w-2 rounded-full transition-all ${
                        index === selectedImageIndex ? "bg-primary w-4" : "bg-background/50"
                        }`}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="hidden md:grid grid-cols-4 gap-4">
              {images.map((edge, index) => (
                <button
                  key={index}
                  className={`relative aspect-square overflow-hidden rounded-lg bg-muted transition-all ${
                    index === selectedImageIndex ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-75"
                    }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    src={edge.node.url || "/placeholder.svg"}
                    alt={edge.node.altText || `${product.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 12.5vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-wide uppercase md:text-6xl font-calsans">{product.title}</h1>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">${Number.parseFloat(currentPrice.amount).toFixed(2)}</span>
            <span className="text-muted-foreground">{currentPrice.currencyCode}</span>
          </div>

          <div
            className="prose prose-sm max-w-none text-lg text-muted-foreground [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>h1]:text-2xl [&>h2]:text-xl [&>h3]:text-lg [&>strong]:font-semibold"
            dangerouslySetInnerHTML={{
              __html:
                product.descriptionHtml ||
                product.description ||
                "",
            }}
          />

          <VariantSelector options={product.options} variants={product.variants} onVariantChange={setSelectedVariant} />

          <AddToCart variant={selectedVariant} productTitle={product.title} disabled={!product.availableForSale} />
          {priceTransparency ?.value ? (
            <div className="space-y-4 rounded-lg bg-muted p-4 text-sm">
              <h2 className="font-semibold text-lg">Price Transparency:</h2>
              <div className="whitespace-pre-line">
                {priceTransparency.value}
              </div>
            </div>
          ) : null}


          {/* 
        <div className="rounded-lg bg-muted p-4 text-sm">
        <h2 className="font-semibold mb-2 text-base">How to Prepare:</h2>
        <ol className="space-y-1 text-muted-foreground">
        <li>1. Add one packet to 8oz hot water</li>
        <li>2. Stir until dissolved</li>
        <li>3. Enjoy your perfect cup of coffee</li>
        </ol>
      </div> */}
        </div>
      </div>
    </>
  )
}
