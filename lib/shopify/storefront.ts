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

export type Money = {
  amount: string
  currencyCode: string
}

export type SelectedOption = {
  name: string
  value: string
}

export type ProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  selectedOptions: SelectedOption[]
  price: Money
}

export type ProductOption = {
  id: string
  name: string
  values: string[]
}

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
  availableForSale: boolean
  options: ProductOption[]
  variants: ProductVariant[]
}

export type ShopifyCartLine = {
  id: string
  quantity: number
  merchandise: ProductVariant & {
    product: {
      title: string
      handle?: string
      images: {
        edges: Array<{ node: { url: string; altText: string | null } }>
      }
    }
  }
}

export type ShopifyCart = {
  id: string
  lines: {
    edges: Array<{ node: ShopifyCartLine }>
  }
  cost: {
    totalAmount: Money
    subtotalAmount?: Money
    totalTaxAmount?: Money | null
  }
  checkoutUrl: string
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

export async function getProducts(
  first = 12,
  collectionHandle?: string,
): Promise<ShopifyProduct[]> {
  try {
    const query = collectionHandle
      ? `
        query GetProductsByCollection($first: Int!, $handle: String!) {
          collectionByHandle(handle: $handle) {
            products(first: $first) {
              edges {
                node {
                  id
                  title
                  handle
                  description
                  availableForSale
                  options {
                    id
                    name
                    values
                  }
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
                  variants(first: 10) {
                    edges {
                      node {
                        id
                        title
                        availableForSale
                        price {
                          amount
                          currencyCode
                        }
                        selectedOptions {
                          name
                          value
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `
      : `
        query GetProducts($first: Int!) {
          products(first: $first) {
            edges {
              node {
                id
                title
                handle
                description
                availableForSale
                options {
                  id
                  name
                  values
                }
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
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      availableForSale
                      price {
                        amount
                        currencyCode
                      }
                      selectedOptions {
                        name
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `

    const variables = collectionHandle ? { first, handle: collectionHandle } : { first }

    const data = await shopifyFetch<
      collectionHandle extends string
        ? {
            collectionByHandle: {
              products: {
                edges: Array<{ node: ShopifyProduct & { variants: { edges: any[] } } }>
              }
            } | null
          }
        : {
            products: {
              edges: Array<{ node: ShopifyProduct & { variants: { edges: any[] } } }>
            }
          }
    >(query, variables)

    const edges =
      collectionHandle
        ? (data as any).collectionByHandle?.products?.edges ?? []
        : (data as any).products?.edges ?? []

    return edges.map((edge: any) => ({
      ...edge.node,
      variants: edge.node.variants.edges.map((v: any) => v.node),
    }))
  } catch (error) {
    console.error("Failed to fetch products from Shopify:", error)
    return []
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
          availableForSale
          options {
            id
            name
            values
          }
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
          variants(first: 50) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyFetch<{
      productByHandle: {
        id: string
        title: string
        handle: string
        description: string
        availableForSale: boolean
        options: ProductOption[]
        priceRange: {
          minVariantPrice: Money
        }
        images: {
          edges: Array<{ node: { url: string; altText: string | null } }>
        }
        variants: {
          edges: Array<{
            node: {
              id: string
              title: string
              availableForSale: boolean
              price: Money
              selectedOptions: SelectedOption[]
            }
          }>
        }
      } | null
    }>(query, { handle })

    if (!data.productByHandle) {
      return null
    }

    const product = data.productByHandle
    return {
      ...product,
      variants: product.variants.edges.map((edge) => edge.node),
    }
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

export async function createCart(): Promise<ShopifyCart> {
  const query = `
    mutation cartCreate {
      cartCreate {
        cart {
          id
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      title
                      handle
                      images(first: 1) {
                        edges {
                          node {
                            url
                            altText
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
            totalTaxAmount {
              amount
              currencyCode
            }
          }
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyFetch<{
    cartCreate: {
      cart: ShopifyCart
      userErrors: Array<{ field: string; message: string }>
    }
  }>(query)

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors[0].message)
  }

  return data.cartCreate.cart
}

export async function addCartLines(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>,
): Promise<ShopifyCart> {
  const query = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      title
                      handle
                      images(first: 1) {
                        edges {
                          node {
                            url
                            altText
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
            totalTaxAmount {
              amount
              currencyCode
            }
          }
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyFetch<{
    cartLinesAdd: {
      cart: ShopifyCart
      userErrors: Array<{ field: string; message: string }>
    }
  }>(query, {
    cartId,
    lines,
  })

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(data.cartLinesAdd.userErrors[0].message)
  }

  return data.cartLinesAdd.cart
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>,
): Promise<ShopifyCart> {
  const query = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      title
                      handle
                      images(first: 1) {
                        edges {
                          node {
                            url
                            altText
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
            totalTaxAmount {
              amount
              currencyCode
            }
          }
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyFetch<{
    cartLinesUpdate: {
      cart: ShopifyCart
      userErrors: Array<{ field: string; message: string }>
    }
  }>(query, {
    cartId,
    lines,
  })

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(data.cartLinesUpdate.userErrors[0].message)
  }

  return data.cartLinesUpdate.cart
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
  const query = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      title
                      handle
                      images(first: 1) {
                        edges {
                          node {
                            url
                            altText
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
            totalTaxAmount {
              amount
              currencyCode
            }
          }
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const data = await shopifyFetch<{
    cartLinesRemove: {
      cart: ShopifyCart
      userErrors: Array<{ field: string; message: string }>
    }
  }>(query, {
    cartId,
    lineIds,
  })

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(data.cartLinesRemove.userErrors[0].message)
  }

  return data.cartLinesRemove.cart
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
        checkoutUrl
      }
    }
  `

  const data = await shopifyFetch<{
    cart: ShopifyCart | null
  }>(query, { cartId })

  return data.cart
}
