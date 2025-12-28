"use client"

import { createContext, useContext, useState, useEffect, useTransition, type ReactNode } from "react"
import { addItem, removeItem, updateItem, getCartData } from "@/app/actions/cart"
import type { ShopifyCart, ProductVariant } from "@/lib/shopify/storefront"
import { useToast } from "@/hooks/use-toast"

type CartContextType = {
  cart: ShopifyCart | null
  itemCount: number
  addItem: (variant: ProductVariant) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  refreshCart: () => Promise<void>
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null)
  const [isLoading, startTransition] = useTransition()
  const { toast } = useToast()

  const itemCount = cart?.lines.edges.reduce((total, { node }) => total + node.quantity, 0) ?? 0

  const refreshCart = async () => {
    console.log("[v0] Refreshing cart...")
    const cartData = await getCartData()
    console.log("[v0] Cart data received:", cartData?.lines.edges.length ?? 0, "line items")
    setCart(cartData)
  }

  useEffect(() => {
    refreshCart()
  }, [])

  const addItemToCart = async (variant: ProductVariant) => {
    startTransition(async () => {
      try {
        console.log("[v0] Adding item to cart:", variant.id)
        const updatedCart = await addItem(variant.id, 1)
        console.log("[v0] Updated cart received with", updatedCart.lines.edges.length, "line items")
        setCart(updatedCart)
        toast({
          title: "Added to cart",
          description: `${variant.title} has been added to your cart.`,
        })
      } catch (error) {
        console.error("[v0] Error adding item to cart:", error)
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const removeItemFromCart = async (lineId: string) => {
    startTransition(async () => {
      try {
        const updatedCart = await removeItem(lineId)
        setCart(updatedCart)
        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart.",
        })
      } catch (error) {
        console.error("[v0] Error removing item from cart:", error)
        toast({
          title: "Error",
          description: "Failed to remove item. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const updateItemQuantity = async (lineId: string, quantity: number) => {
    startTransition(async () => {
      try {
        const updatedCart = await updateItem(lineId, quantity)
        setCart(updatedCart)
      } catch (error) {
        console.error("[v0] Error updating item quantity:", error)
        toast({
          title: "Error",
          description: "Failed to update quantity. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        addItem: addItemToCart,
        removeItem: removeItemFromCart,
        updateItem: updateItemQuantity,
        refreshCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
