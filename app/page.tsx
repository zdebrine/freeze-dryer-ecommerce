import { getProducts, getProduct } from "@/lib/shopify/storefront"
import { ProductGrid } from "@/components/shop/product-grid"
import { Testimonials } from "@/components/shop/testimonials"
import { ProductOfTheMonth } from "@/components/shop/product-of-the-month"
import { ShopFooter } from "@/components/shop/footer"
import { ShopHeader } from "@/components/shop/header"
import { HeroSection } from "@/components/shop/hero-section"
import { ShopifySetupNotice } from "@/components/shop/shopify-setup-notice"
import { getHomepageData, getTestimonials } from "@/lib/sanity/queries"

export default async function HomePage() {
  const [homepageData, testimonials] = await Promise.all([getHomepageData(), getTestimonials()])

  // Fetch products server-side for better SEO and performance
  let products = []
  let hasShopifyError = false

  try {
    products = await getProducts(8)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    hasShopifyError = true
  }

  let featuredProduct = null
  if (homepageData?.featuredProductHandle) {
    try {
      featuredProduct = await getProduct(homepageData.featuredProductHandle)
    } catch (error) {
      console.error("Failed to fetch featured product:", error)
    }
  }

  const isShopifyConfigured = products.length > 0

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader />

      {/* Hero Section - Now using Sanity data */}
      <HeroSection title={homepageData?.heroTitle} subtitle={homepageData?.heroSubtitle} />

      {/* Shopify Setup Notice - Only show if not configured */}
      {!isShopifyConfigured && <ShopifySetupNotice />}

      {/* Product Grid - Using Sanity data for section titles */}
      <section id="products" className="border-t bg-background px-4 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {homepageData?.productSectionTitle || "Our Coffee"}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {homepageData?.productSectionSubtitle || "Freeze-dried perfection in every packet"}
            </p>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>

      {/* Product of the Month - Show featured product from Sanity or fallback to first product */}
      {isShopifyConfigured && <ProductOfTheMonth products={featuredProduct ? [featuredProduct] : products} />}

      {/* Testimonials - Using Sanity data */}
      <Testimonials
        testimonials={testimonials}
        sectionTitle={homepageData?.testimonialSectionTitle}
        sectionSubtitle={homepageData?.testimonialSectionSubtitle}
      />

      {/* Footer */}
      <ShopFooter />
    </div>
  )
}
