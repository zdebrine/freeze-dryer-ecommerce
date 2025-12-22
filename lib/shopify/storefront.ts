/**
 * Shopify Storefront API - Server-Side Only
 *
 * All Shopify API calls are now server-side only for better security.
 * Uses server-side environment variables that are never exposed to the client.
 */

import "server-only"

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_NAME
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

if (!SHOPIFY_STORE_DOMAIN) {
  console.warn("⚠️ SHOPIFY_STORE_NAME environment variable not configured")
}

if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.warn("⚠️ SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable not configured")
  console.warn("📝 To set up Shopify Storefront API:")
  console.warn("   1. Go to Shopify Admin → Apps → Develop apps")
  console.warn("   2. Create a new app or select existing")
  console.warn("   3. Click 'Configure' under Storefront API")
  console.warn("   4. Enable 'unauthenticated_read_product_listings' scope")
  console.warn("   5. Copy the Storefront API access token")
  console.warn("   6. Add SHOPIFY_STOREFRONT_ACCESS_TOKEN to your environment variables")
}

const SHOPIFY_GRAPHQL_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}.myshopify.com/api/2024-01/graphql.json`

export type ShopifyProduct = {
  id: string
  title: string
  handle: string
  description: string
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  images: {
    edges: Array<{
      node: {
        url: string
        altText: string | null
      }
    }>
  }
  variants: {
    edges: Array<{
      node: {
        id: string
        title: string
        priceV2: {
          amount: string
          currencyCode: string
        }
      }
    }>
  }
}

export type ShopifyCollection = {
  id: string
  title: string
  handle: string
  description: string
  products: {
    edges: Array<{
      node: ShopifyProduct
    }>
  }
}

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error(
      "Shopify configuration incomplete. Please set SHOPIFY_STORE_NAME and SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variables.",
    )
  }

  const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    next: { revalidate: 60 }, // Revalidate every minute for product updates
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[Shopify API Error] Status: ${response.status}`, errorText)
    throw new Error(`Shopify Storefront API error: ${response.status}`)
  }

  const json = await response.json()

  if (json.errors) {
    console.error("[Shopify GraphQL Errors]", json.errors)
    throw new Error(json.errors.map((e: { message: string }) => e.message).join(", "))
  }

  return json.data
}

export async function getProducts(first = 12): Promise<ShopifyProduct[]> {
  try {
    const query = `
      query GetProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    priceV2 {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyFetch<{ products: { edges: Array<{ node: ShopifyProduct }> } }>(query, { first })
    return data.products.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Failed to fetch products from Shopify:", error)
    return [] // Return empty array on error
  }
}

export async function getProduct(handle: string): Promise<ShopifyProduct | null> {
  try {
    const query = `
      query GetProduct($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                priceV2 {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyFetch<{ productByHandle: ShopifyProduct | null }>(query, { handle })
    return data.productByHandle
  } catch (error) {
    console.error(`Failed to fetch product "${handle}" from Shopify:`, error)
    return null
  }
}

export async function getCollections(): Promise<ShopifyCollection[]> {
  try {
    const query = `
      query GetCollections {
        collections(first: 10) {
          edges {
            node {
              id
              title
              handle
              description
            }
          }
        }
      }
    `

    const data = await shopifyFetch<{ collections: { edges: Array<{ node: ShopifyCollection }> } }>(query)
    return data.collections.edges.map((edge) => edge.node)
  } catch (error) {
    console.error("Failed to fetch collections from Shopify:", error)
    return []
  }
}

export function createCheckoutUrl(variantId: string, quantity = 1): string {
  if (!SHOPIFY_STORE_DOMAIN) {
    throw new Error("Shopify store domain not configured")
  }
  // Remove the "gid://shopify/ProductVariant/" prefix if present
  const cleanVariantId = variantId.replace("gid://shopify/ProductVariant/", "")
  return `https://${SHOPIFY_STORE_DOMAIN}.myshopify.com/cart/${cleanVariantId}:${quantity}`
}
