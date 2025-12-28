"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Loader2 } from "lucide-react"
import { useCart } from "./cart-context"
import type { ProductVariant } from "@/lib/shopify/storefront"

type AddToCartProps = {
  variant: ProductVariant | null
  productTitle: string
  disabled?: boolean
}

export function AddToCart({ variant, productTitle, disabled }: AddToCartProps) {
  const { addItem, isLoading } = useCart()

  const handleAddToCart = async () => {
    if (!variant) return
    await addItem(variant, true)
  }

  const isDisabled = disabled || !variant || isLoading

  return (
    <Button onClick={handleAddToCart} disabled={isDisabled} size="lg" className="w-full text-lg">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          {variant ? "Add to Cart" : "Select Options"}
        </>
      )}
    </Button>
  )
}
