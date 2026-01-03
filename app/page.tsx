import { client } from "@/cms/lib/client"
import { LANDING_PAGE_QUERY } from "@/cms/lib/queries"

import { getProducts, getProduct } from "@/lib/shopify/storefront"
import { ProductGrid } from "@/components/shop/product-grid"
import { Testimonials } from "@/components/shop/testimonials"
import { ProductOfTheMonth } from "@/components/shop/product-of-the-month"
import { ShopFooter } from "@/components/shop/footer"
import { ShopHeader } from "@/components/shop/header"
import { HeroSection } from "@/components/shop/hero-section"
import { ShopifySetupNotice } from "@/components/shop/shopify-setup-notice"
import { Cta } from "@/components/shop/cta"
import { CollectionBoxes } from "@/components/shop/collection-boxes"
import { TextMarquee } from "@/components/shop/text-marquee"
import { ImageBanner } from "@/components/shop/image-banner"
import { ProductCarousel } from "@/components/shop/product-carousel"

export const revalidate = 60

export default async function HomePage() {
  const landing = await client.fetch(LANDING_PAGE_QUERY)

  const limit = landing?.productsSection?.limit ?? 8
  const collection = landing?.productsSection?.collection ?? "coffees"

  let products = []
  let hasShopifyError = false

  try {
    products = await getProducts(limit, collection)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    hasShopifyError = true
  }

  const isShopifyConfigured = products.length > 0

  let secondSectionProducts = []
  if (landing?.secondProductsSection?.enabled !== false && landing?.secondProductsSection?.collectionHandle) {
    try {
      secondSectionProducts = await getProducts(
        landing.secondProductsSection.limit || 8,
        landing.secondProductsSection.collectionHandle,
      )
    } catch (error) {
      console.error("Failed to fetch second section products:", error)
    }
  }

  let productOfTheMonthProduct = null
  const productOfTheMonthConfig = landing?.productOfTheMonth

  if (isShopifyConfigured && productOfTheMonthConfig?.enabled !== false) {
    try {
      if (productOfTheMonthConfig?.productHandle) {
        // Fetch specific product by handle
        productOfTheMonthProduct = await getProduct(productOfTheMonthConfig.productHandle)
      } else if (products.length > 0) {
        // Fallback to first product if no handle specified
        productOfTheMonthProduct = products[0]
      }
    } catch (error) {
      console.error("Failed to fetch product of the month:", error)
    }
  }

  // Pull section config with safe defaults
  const productsSection = landing?.productsSection
  const productsAnchorId = productsSection?.anchorId || "products"
  const productsTitle = productsSection?.title || "Our Coffee"
  const productsSubtitle = productsSection?.subtitle || "Freeze-dried perfection in every packet"

  const testimonialsConfig = landing?.testimonialsSection
  const footerConfig = landing?.footer

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader config={landing?.header} />

      <HeroSection config={landing?.hero} />

      <main>
        {/* Shopify Setup Notice - Only show if not configured */}
        {!isShopifyConfigured && <ShopifySetupNotice />}

        {landing?.collectionsSection?.collections && (
          <CollectionBoxes
            title={landing.collectionsSection.title}
            collections={landing.collectionsSection.collections}
            visibleItems={landing.collectionsSection.visibleItems}
          />
        )}

        {landing?.textMarquee?.enabled !== false && landing?.textMarquee?.text && (
          <TextMarquee text={landing.textMarquee.text} speed={landing.textMarquee.speed} />
        )}

        {/* Product Grid */}
        <section id={productsAnchorId} className="border-t bg-background px-4 pt-6 md:pt-10 md:px-8">
          <div className="mx-auto">
            <div className="mb-4 text-center md:mb-12 md:px-16">
              <h2 className="font-calsans text-4xl font-extrabold uppercase tracking-tight md:text-8xl">
                {productsTitle}
              </h2>
            </div>
          </div>
        </section>
        <div className="px-4 pb-12 md:px-16 md:pb-20">
          <ProductGrid products={products} />
        </div>

        {testimonialsConfig?.enabled !== false && <Testimonials config={testimonialsConfig} />}

        {landing?.secondProductsSection?.enabled !== false && secondSectionProducts.length > 0 && (
          <ProductCarousel
            title={landing.secondProductsSection.title}
            products={secondSectionProducts}
            visibleItems={landing.secondProductsSection.visibleItems}
          />
        )}

        {landing?.imageBanner?.enabled !== false && landing?.imageBanner?.imageUrl && (
          <ImageBanner
            imageUrl={landing.imageBanner.imageUrl}
            overlayText={landing.imageBanner.overlayText || ""}
            link={landing.imageBanner.link || "#"}
            textPosition={landing.imageBanner.textPosition}
          />
        )}

        {isShopifyConfigured && productOfTheMonthConfig?.enabled !== false && productOfTheMonthProduct && (
          <ProductOfTheMonth product={productOfTheMonthProduct} config={productOfTheMonthConfig} />
        )}

        <Cta config={landing?.ctaBox} />
      </main>

      {/* Footer */}
      <ShopFooter config={footerConfig} />
    </div>
  )
}
