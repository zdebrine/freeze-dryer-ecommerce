import { getProducts } from "@/lib/shopify/storefront"
import { ProductGrid } from "@/components/shop/product-grid"
import { Testimonials } from "@/components/shop/testimonials"
import { ProductOfTheMonth } from "@/components/shop/product-of-the-month"
import { ShopFooter } from "@/components/shop/footer"
import { ShopHeader } from "@/components/shop/header"
import { HeroSection } from "@/components/shop/hero-section"
import { ShopifySetupNotice } from "@/components/shop/shopify-setup-notice"

export default async function HomePage() {
  // Fetch products server-side for better SEO and performance
  let products = []
  let hasShopifyError = false

  try {
    products = await getProducts(8)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    hasShopifyError = true
  }

  const isShopifyConfigured = products.length > 0

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />

      {/* Hero Section */}
      <HeroSection />

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

      {/* Product of the Month */}
      {isShopifyConfigured && <ProductOfTheMonth products={products} />}

      {/* Testimonials */}
      <Testimonials />

      {/* Footer */}
      <ShopFooter />
    </div>
  )
}
