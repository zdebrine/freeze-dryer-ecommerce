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
import { CollectionBoxes } from "@/components/shop/collection-boxes"
import { TextMarquee } from "@/components/shop/text-marquee"
import { ImageBanner } from "@/components/shop/image-banner"
import { ProductCarousel } from "@/components/shop/product-carousel"

export const revalidate = 60

export default async function HomePage() {
  // 1) Fetch landing config from Sanity
  const landing = await client.fetch(LANDING_PAGE_QUERY)

  // 2) Decide product limit from Sanity (fallback to 8)
  const limit = landing ?.productsSection ?.limit ?? 8
  const collection = landing ?.productsSection ?.collection ?? "coffees"

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

  let secondSectionProducts = []
  if (landing ?.secondProductsSection ?.enabled !== false && landing ?.secondProductsSection ?.collectionHandle) {
    try {
      secondSectionProducts = await getProducts(
        landing.secondProductsSection.limit || 8,
        landing.secondProductsSection.collectionHandle,
      )
    } catch (error) {
      console.error("Failed to fetch second section products:", error)
    }
  }

  // Pull section config with safe defaults
  const productsSection = landing ?.productsSection
  const productsAnchorId = productsSection ?.anchorId || "products"
  const productsTitle = productsSection ?.title || "Our Coffee"
  const productsSubtitle = productsSection ?.subtitle || "Freeze-dried perfection in every packet"

  const productOfTheMonthConfig = landing ?.productOfTheMonth
  const testimonialsConfig = landing ?.testimonialsSection
  const footerConfig = landing ?.footer

  console.log(productOfTheMonthConfig)

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader config={landing ?.header} />

      <HeroSection config={landing ?.hero} />

      {/* Shopify Setup Notice - Only show if not configured */}
      {!isShopifyConfigured && <ShopifySetupNotice />}

      {landing ?.collectionsSection ?.collections && (
        <CollectionBoxes
          title={landing.collectionsSection.title}
          collections={landing.collectionsSection.collections}
          visibleItems={landing.collectionsSection.visibleItems}
        />
      )}

      {landing ?.textMarquee ?.enabled !== false && landing ?.textMarquee ?.text && (
        <TextMarquee text={landing.textMarquee.text} speed={landing.textMarquee.speed} />
      )}

      {/* Product Grid */}
      <section id={productsAnchorId} className="border-t bg-background px-4 pt-10 md:pt-20">
        <div className="mx-auto">
          <div className="mb-4 text-center md:mb-12 md:px-16">
            <h2 className="font-calsans text-5xl font-extrabold uppercase tracking-tight md:text-8xl">
              {productsTitle}
            </h2>
            {/* <p className="mt-4 text-lg text-muted-foreground">{productsSubtitle}</p> */}
          </div>
        </div>
      </section>
      <div className="px-4 pb-20 md:px-16">
        <ProductGrid products={products} />
      </div>

      {testimonialsConfig ?.enabled !== false && <Testimonials config={testimonialsConfig} />}

      {landing ?.secondProductsSection ?.enabled !== false && secondSectionProducts.length > 0 && (
        <ProductCarousel
          title={landing.secondProductsSection.title}
          products={secondSectionProducts}
          visibleItems={landing.secondProductsSection.visibleItems}
        />
      )}

      {landing ?.imageBanner ?.enabled !== false && landing ?.imageBanner ?.imageUrl && (
        <ImageBanner
          imageUrl={landing.imageBanner.imageUrl}
          overlayText={landing.imageBanner.overlayText || ""}
          link={landing.imageBanner.link || "#"}
          textPosition={landing.imageBanner.textPosition}
        />
      )}

      {isShopifyConfigured && productOfTheMonthConfig ?.enabled !== false && (
        <ProductOfTheMonth config={productOfTheMonthConfig} />
      )}
      <Cta config={landing ?.ctaBox} />

      {/* Footer */}
      <ShopFooter config={footerConfig} />
    </div>
  )
}
