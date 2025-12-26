import { client } from "@/cms/lib/client"
import { LANDING_PAGE_QUERY } from "@/cms/lib/queries"

import { getProducts } from "@/lib/shopify/storefront"
import { ProductGrid } from "@/components/shop/product-grid"
import { Testimonials } from "@/components/shop/testimonials"
import { ProductOfTheMonth } from "@/components/shop/product-of-the-month"
import { ShopFooter } from "@/components/shop/footer"
import { ShopHeader } from "@/components/shop/header"
import { HeroSection } from "@/components/shop/hero-section"
import { ShopifySetupNotice } from "@/components/shop/shopify-setup-notice"
import { Cta } from "@/components/shop/cta"

export const revalidate = 60

export default async function HomePage() {
  // 1) Fetch landing config from Sanity
  const landing = await client.fetch(LANDING_PAGE_QUERY)

  // 2) Decide product limit from Sanity (fallback to 8)
  const limit = landing ?.productsSection ?.limit ?? 8
  const collection = landing ?.productsSection ?.collection ?? 'coffees'

  // 3) Fetch products from Shopify
  let products = []
  let hasShopifyError = false

  try {
    products = await getProducts(limit, collection)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    hasShopifyError = true
  }

  const isShopifyConfigured = products.length > 0

  // 4) Pull section config with safe defaults
  const productsSection = landing ?.productsSection
  const productsAnchorId = productsSection ?.anchorId || "products"
  const productsTitle = productsSection ?.title || "Our Coffee"
  const productsSubtitle = productsSection ?.subtitle || "Freeze-dried perfection in every packet"

  const productOfTheMonthConfig = landing ?.productOfTheMonth
  const testimonialsConfig = landing ?.testimonialsSection
  const footerConfig = landing ?.footer

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader config={landing ?.header} />

      <HeroSection config={landing ?.hero} />

      {/* Shopify Setup Notice - Only show if not configured */}
      {!isShopifyConfigured && <ShopifySetupNotice />}

      {/* Product Grid */}
      <section id={productsAnchorId} className="border-t bg-background px-4 pt-10 md:pt-20">
        <div className="mx-auto">
          <div className="mb-4 md:mb-12 text-center md:px-16">
            <h2 className="text-5xl font-extrabold tracking-tight md:text-8xl font-calsans uppercase">{productsTitle}</h2>
            {/* <p className="mt-4 text-lg text-muted-foreground">{productsSubtitle}</p> */}
          </div>

        </div>
      </section>
      <div className="md:px-16 px-4 pb-20">
        <ProductGrid products={products} />
      </div>
      {/* Product of the Month */}
      {isShopifyConfigured && productOfTheMonthConfig ?.enabled !== false && (
        <ProductOfTheMonth products={products} config={productOfTheMonthConfig} />
      )}

      {/* Testimonials */}
      {testimonialsConfig ?.enabled !== false && <Testimonials config={testimonialsConfig} />}
      <Cta config={landing ?.ctaBox}  />

      {/* Footer */}
      <ShopFooter config={footerConfig} />
    </div>
  )
}
