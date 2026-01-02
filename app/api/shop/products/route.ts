import { NextResponse } from "next/server"
import { getProductsPage } from "@/lib/shopify/storefront"

export const revalidate = 60

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const cursor = searchParams.get("cursor") ?? undefined
  const limit = Number.parseInt(searchParams.get("limit") ?? "24", 10)

  const result = await getProductsPage(
    {
      search: searchParams.get("search") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      vendor: searchParams.get("vendor") ?? undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
      sort: (searchParams.get("sort") as any) ?? undefined,
    },
    cursor,
    Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 50) : 24,
  )

  return NextResponse.json(result, {
    headers: {
      // CDN-friendly caching on Vercel
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  })
}
