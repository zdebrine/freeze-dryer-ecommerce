import { client } from "@/sanity/lib/client"
import { LANDING_PAGE_QUERY } from "@/sanity/lib/queries"

import { getProducts, getProduct } from "@/lib/shopify/storefront"
import { ProductGrid } from "@/components/shop/product-grid"
import { Testimonials } from "@/components/shop/testimonials"
import { ProductOfTheMonth } from "@/components/shop/product-of-the-month"
import { ShopFooter } from "@/components/shop/footer"
import { ShopHeader } from "@/components/shop/header"
import { HeroSection } from "@/components/shop/hero-section"
import { ShopifySetupNotice } from "@/components/shop/shopify-setup-notice"

export const revalidate = 60

export default async function HomePage() {
  const landing = await client.fetch(LANDING_PAGE_QUERY)

  let products = []
  let hasShopifyError = false

  const limit = 8

  try {
    products = await getProducts(limit)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    hasShopifyError = true
  }

  const isShopifyConfigured = products.length > 0

  return (
    <div className="flex min-h-screen flex-col">
   <ShopHeader config={landing?.header} theme={landing?.theme} />

<HeroSection config={landing?.hero} />

      {/* Shopify Setup Notice - Only show if not configured */}
      {!isShopifyConfigured && <ShopifySetupNotice />}

      {/* Product Grid */}
      <section id="products" className="border-t bg-background px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Our Coffee</h2>
            <p className="mt-4 text-lg text-muted-foreground">Freeze-dried perfection in every packet</p>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>


    </div>
  )
}
