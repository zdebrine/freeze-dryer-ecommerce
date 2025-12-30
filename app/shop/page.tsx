import { Suspense } from "react"
import { ShopHeader } from "@/components/shop/header"
import { ShopFooter } from "@/components/shop/footer"
import { client } from "@/cms/lib/client"
import { LANDING_PAGE_QUERY } from "@/cms/lib/queries"
import { ShopAllClient } from "./shop-all-client"
import { getAllProducts, getProductFilters } from "@/lib/shopify/storefront"

export const revalidate = 60

type SearchParams = Promise<{
  search?: string
  type?: string
  vendor?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
  page?: string
}>

export default async function ShopAllPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const [landing, { products, hasNextPage, endCursor }, filters] = await Promise.all([
    client.fetch(LANDING_PAGE_QUERY),
    getAllProducts(undefined, 50),
    getProductFilters(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader config={landing?.header} />

      <main>
        <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading products...</div>}>
          <ShopAllClient
            initialProducts={products}
            initialHasNextPage={hasNextPage}
            initialEndCursor={endCursor}
            filters={filters}
            searchParams={params}
          />
        </Suspense>
      </main>

      <ShopFooter config={landing?.footer} />
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: "Shop All Products | Freeze Dryer",
    description:
      "Browse our complete collection of freeze dryers and accessories. Filter by type, brand, and price to find the perfect product for your needs.",
  }
}
