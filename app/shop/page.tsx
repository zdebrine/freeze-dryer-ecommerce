// app/shop/page.tsx
import { Suspense } from "react"
import { ShopHeader } from "@/components/shop/header"
import { ShopFooter } from "@/components/shop/footer"
import { client } from "@/cms/lib/client"
import { LANDING_PAGE_QUERY } from "@/cms/lib/queries"
import { ShopAllClient } from "./shop-all-client"
import { getProductsPage, getShopFilters } from "@/lib/shopify/storefront"

export const revalidate = 60

type SearchParams = Promise<{
  search?: string
  type?: string
  vendor?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
}>

export default async function ShopAllPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const [landing, firstPage, filters] = await Promise.all([
    client.fetch(LANDING_PAGE_QUERY),
    getProductsPage(
      {
        search: params.search,
        type: params.type,
        vendor: params.vendor,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        sort: params.sort as any,
      },
      undefined,
      24,
    ),
    getShopFilters(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader config={landing?.header} />

      <main>
        <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading products...</div>}>
          <ShopAllClient
            initialProducts={firstPage.products}
            initialHasNextPage={firstPage.hasNextPage}
            initialEndCursor={firstPage.endCursor}
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
      "Browse our complete collection. Filter by type, brand, and price to find the perfect product for your needs.",
  }
}
