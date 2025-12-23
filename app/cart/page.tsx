import { ShopHeader } from "@/components/shop/header"
import { ShopFooter } from "@/components/shop/footer"
import { CartItems } from "@/components/cart/cart-items"

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />

      <main className="flex-1 pt-16">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <h1 className="mb-8 text-4xl font-bold tracking-tight">Shopping Cart</h1>
          <CartItems />
        </div>
      </main>

      <ShopFooter />
    </div>
  )
}
