import { notFound } from "next/navigation"
import { ShopHeader } from "@/components/shop/header"
import { ShopFooter } from "@/components/shop/footer"
import { getProduct } from "@/lib/shopify/storefront"
import { ProductClient } from "./product-client"
import { client } from "@/cms/lib/client"
import { LANDING_PAGE_QUERY } from "@/cms/lib/queries"

export const revalidate = 60

type ProductPageProps = {
  params: Promise<{ handle: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params

  const landing = await client.fetch(LANDING_PAGE_QUERY)

  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ShopHeader config={landing?.header} />

      <main className="flex-1 pt-16">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <ProductClient product={product} />
        </div>
      </main>

      <ShopFooter config={landing?.footer} />
    </div>
  )
}
