import { client } from "@/cms/lib/client"
import { LANDING_PAGE_QUERY } from "@/cms/lib/queries"
import { getProducts } from "@/lib/shopify/storefront"
import { ProductGrid } from "@/components/shop/product-grid"
import { ShopFooter } from "@/components/shop/footer"
import { ShopHeader } from "@/components/shop/header"
import { notFound } from "next/navigation"

export const revalidate = 60

type CollectionPageProps = {
  params: Promise<{ handle: string }>
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { handle } = await params

  // Fetch landing page config for header/footer
  const landing = await client.fetch(LANDING_PAGE_QUERY)

  // Fetch products from this collection
  let products = []
  const collectionTitle = handle
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  try {
    products = await getProducts(100, handle) // Fetch up to 100 products
  } catch (error) {
    console.error(`Failed to fetch collection "${handle}":`, error)
  }

  // If no products found, show 404
  if (products.length === 0) {
    notFound()
  }

  const footerConfig = landing?.footer

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader config={landing?.header} />

      {/* Collection Header */}
      <section className="border-t bg-background px-4 pt-30 pb-0 md:pt-40 md:pb-20">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 text-center md:mb-0">
            <h1 className="font-calsans text-5xl font-extrabold uppercase md:text-8xl">
              {collectionTitle}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <div className="px-4 pb-20 md:px-16">
        <ProductGrid products={products} />
      </div>

      <ShopFooter config={footerConfig} />
    </div>
  )
}
