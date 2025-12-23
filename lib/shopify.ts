type ShopifyProduct = {
    id: string
    title: string
    handle: string
    description: string
    featuredImage?: { url: string; altText?: string | null }
    price?: { amount: string; currencyCode: string }
  }
  
  const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!
  const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!
  
  async function shopifyFetch<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2025-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
      // nice default for a homepage:
      next: { revalidate: 60 },
    })
  
    if (!res.ok) throw new Error(`Shopify fetch failed: ${res.status}`)
    const json = await res.json()
    if (json.errors?.length) throw new Error(json.errors[0].message)
    return json.data
  }
  
  export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
    const query = /* GraphQL */ `
      query ProductByHandle($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    `
  
    const data = await shopifyFetch<{ product: any }>(query, { handle })
    const p = data.product
    if (!p) return null
  
    return {
      id: p.id,
      title: p.title,
      handle: p.handle,
      description: p.description,
      featuredImage: p.featuredImage ?? undefined,
      price: p.priceRange?.minVariantPrice
        ? {
            amount: p.priceRange.minVariantPrice.amount,
            currencyCode: p.priceRange.minVariantPrice.currencyCode,
          }
        : undefined,
    }
  }
  