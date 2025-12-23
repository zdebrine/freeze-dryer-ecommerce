"use client"

import { useCart } from "./cart-context"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function CartItems() {
  const { cart, removeItem, updateItem, isLoading } = useCart()

  if (!cart || cart.lines.edges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="mb-4 text-xl text-muted-foreground">Your cart is empty</p>
        <Button asChild>
          <Link href="/#products">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  const subtotal = Number.parseFloat(cart.cost.totalAmount.amount)

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {cart.lines.edges.map(({ node: item }) => {
          const image = item.merchandise.product.images.edges[0]?.node
          const price = Number.parseFloat(item.merchandise.price.amount)
          const lineTotal = price * item.quantity

          return (
            <div key={item.id} className="flex gap-4 rounded-lg border p-4">
              {/* Product Image */}
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                {image ? (
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.altText || item.merchandise.product.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-semibold">{item.merchandise.product.title}</h3>
                  {item.merchandise.title !== "Default Title" && (
                    <p className="text-sm text-muted-foreground">{item.merchandise.title}</p>
                  )}
                  <p className="mt-1 text-sm font-medium">
                    ${price.toFixed(2)} {item.merchandise.price.currencyCode}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                      disabled={isLoading || item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeItem(item.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Line Total */}
              <div className="flex flex-col items-end justify-between">
                <p className="font-semibold">${lineTotal.toFixed(2)}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cart Summary */}
      <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
        <div className="flex justify-between text-lg">
          <span className="font-semibold">Subtotal</span>
          <span className="font-bold">
            ${subtotal.toFixed(2)} {cart.cost.totalAmount.currencyCode}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Shipping and taxes calculated at checkout</p>
        <Button asChild className="w-full" size="lg" disabled={isLoading}>
          <a href={cart.checkoutUrl} target="_blank" rel="noopener noreferrer">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Proceed to Checkout"
            )}
          </a>
        </Button>
        <Button asChild variant="outline" className="w-full bg-transparent">
          <Link href="/#products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  )
}
