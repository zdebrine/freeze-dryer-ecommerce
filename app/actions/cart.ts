"use server"

import { cookies } from "next/headers"
import {
  createCart,
  addCartLines,
  removeCartLines,
  updateCartLines,
  getCart,
  type ShopifyCart,
} from "@/lib/shopify/storefront"

const CART_COOKIE = "shopify_cart_id"

export async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CART_COOKIE)?.value
}

async function setCartId(cartId: string) {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function getOrCreateCart(): Promise<ShopifyCart> {
  const cartId = await getCartId()

  if (cartId) {
    const cart = await getCart(cartId)
    if (cart) return cart
  }

  // Create new cart if none exists or invalid
  const newCart = await createCart()
  await setCartId(newCart.id)
  return newCart
}

export async function addItem(merchandiseId: string, quantity = 1): Promise<ShopifyCart> {
  const cart = await getOrCreateCart()
  return await addCartLines(cart.id, [{ merchandiseId, quantity }])
}

export async function removeItem(lineId: string): Promise<ShopifyCart> {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No cart found")

  return await removeCartLines(cartId, [lineId])
}

export async function updateItem(lineId: string, quantity: number): Promise<ShopifyCart> {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No cart found")

  return await updateCartLines(cartId, [{ id: lineId, quantity }])
}

export async function getCartData(): Promise<ShopifyCart | null> {
  const cartId = await getCartId()
  if (!cartId) return null

  return await getCart(cartId)
}
