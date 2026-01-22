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
  descriptionHtml: string
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
    maxVariantPrice?: {
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
  productType?: string
  vendor?: string
  tags?: string[]
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

type ProductEdge = {
  node: ShopifyProduct & { variants: { edges: Array<{ node: ProductVariant }> } }
}

type CollectionProductsResponse = {
  collectionByHandle: {
    products: {
      edges: ProductEdge[]
    }
  } | null
}

type ProductsResponse = {
  products: {
    edges: ProductEdge[]
  }
}

type ProductByHandleResponse = {
  productByHandle: {
    id: string
    title: string
    handle: string
    description: string
    descriptionHtml: string
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
}

async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { cache?: RequestCache; revalidate?: number | false },
): Promise<T> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error(
      "Shopify configuration incomplete. Please set SHOPIFY_STORE_NAME and SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variables.",
    )
  }

  const cacheConfig = options?.cache
    ? { cache: options.cache }
    : options?.revalidate !== undefined
      ? { next: { revalidate: options.revalidate } }
      : { next: { revalidate: 60 } }

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
    ...cacheConfig,
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

export async function getProducts(first = 12, collectionHandle?: string): Promise<ShopifyProduct[]> {
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
                  descriptionHtml
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
                descriptionHtml
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

    const data = collectionHandle
      ? await shopifyFetch<CollectionProductsResponse>(query, variables)
      : await shopifyFetch<ProductsResponse>(query, variables)

    const edges = collectionHandle
      ? ((data as CollectionProductsResponse).collectionByHandle?.products?.edges ?? [])
      : ((data as ProductsResponse).products?.edges ?? [])

    return edges.map((edge) => ({
      ...edge.node,
      variants: edge.node.variants.edges.map((v) => v.node),
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
          metafields(identifiers: [
            { namespace: "custom", key: "one_liner" }
            { namespace: "custom", key: "funkiness" }
            { namespace: "custom", key: "nuttiness" }
            { namespace: "custom", key: "frutiness" }
            { namespace: "custom", key: "roast_level" }
            { namespace: "custom", key: "ingredients" }
            { namespace: "custom", key: "price_transparency" }
          ]) {
            namespace
            key
            type
            value
          }
          description
          descriptionHtml
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

    const data = await shopifyFetch<ProductByHandleResponse>(query, { handle })

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
    cartCreate: { cart: ShopifyCart; userErrors: Array<{ field: string; message: string }> }
  }>(query, {}, { cache: "no-store" })

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
    cartLinesAdd: { cart: ShopifyCart; userErrors: Array<{ field: string; message: string }> }
  }>(
    query,
    {
      cartId,
      lines,
    },
    { cache: "no-store" },
  )

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
    cartLinesUpdate: { cart: ShopifyCart; userErrors: Array<{ field: string; message: string }> }
  }>(
    query,
    {
      cartId,
      lines,
    },
    { cache: "no-store" },
  )

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
    cartLinesRemove: { cart: ShopifyCart; userErrors: Array<{ field: string; message: string }> }
  }>(
    query,
    {
      cartId,
      lineIds,
    },
    { cache: "no-store" },
  )

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

  const data = await shopifyFetch<{ cart: ShopifyCart | null }>(query, { cartId }, { cache: "no-store" })

  return data.cart
}

type SortParam = "featured" | "price-asc" | "price-desc" | "title-asc" | "title-desc"

export type ProductListParams = {
  search?: string
  type?: string
  vendor?: string
  minPrice?: string
  maxPrice?: string
  sort?: SortParam
}

export type ProductPageResult = {
  products: ShopifyProduct[]
  hasNextPage: boolean
  endCursor: string | null
}

function quoteIfNeeded(value: string) {
  const escaped = value.replace(/"/g, '\\"')
  return /\s/.test(escaped) ? `"${escaped}"` : escaped
}


function buildShopifyQuery(params: ProductListParams) {
  const parts: string[] = []

  const search = params.search?.trim()
  if (search) {
    // Treat as general search term (Shopify handles relevance matching)
    parts.push(quoteIfNeeded(search))
  }

  const type = params.type?.trim()
  if (type && type !== "All types") {
    parts.push(`product_type:${quoteIfNeeded(type)}`)
  }

  const vendor = params.vendor?.trim()
  if (vendor && vendor !== "All brands") {
    parts.push(`vendor:${quoteIfNeeded(vendor)}`)
  }

  const min = Number.parseFloat(params.minPrice ?? "")
  if (Number.isFinite(min)) {
    parts.push(`variants.price:>=${min}`)
  }

  const max = Number.parseFloat(params.maxPrice ?? "")
  if (Number.isFinite(max)) {
    parts.push(`variants.price:<=${max}`)
  }

  return parts.join(" ")
}

function mapSort(sort: SortParam | undefined, hasSearch: boolean) {
  // ProductSortKeys supports RELEVANCE, but Shopify warns it's for search queries. :contentReference[oaicite:4]{index=4}
  if (!sort || sort === "featured") {
    return { sortKey: hasSearch ? "RELEVANCE" : "BEST_SELLING", reverse: false }
  }

  switch (sort) {
    case "price-asc":
      return { sortKey: "PRICE", reverse: false }
    case "price-desc":
      return { sortKey: "PRICE", reverse: true }
    case "title-asc":
      return { sortKey: "TITLE", reverse: false }
    case "title-desc":
      return { sortKey: "TITLE", reverse: true }
    default:
      return { sortKey: hasSearch ? "RELEVANCE" : "BEST_SELLING", reverse: false }
  }
}

export async function getProductsPage(
  params: ProductListParams,
  cursor?: string,
  limit = 24,
): Promise<ProductPageResult> {
  const queryString = buildShopifyQuery(params)
  const hasSearch = Boolean(params.search?.trim())
  const { sortKey, reverse } = mapSort(params.sort, hasSearch)

  const query = `
    query ProductsPage($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
        edges {
          cursor
          node {
            id
            title
            handle
            availableForSale
            productType
            vendor
            tags
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            images(first: 1) {
              edges { node { url altText } }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price { amount currencyCode }
                  selectedOptions { name value }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `

  try {
    const variables = {
      first: limit,
      after: cursor ?? null,
      query: queryString || null,
      sortKey,
      reverse,
    }

    const data = await shopifyFetch<{
      products: {
        edges: Array<{
          cursor: string
          node: ShopifyProduct & {
            variants: { edges: Array<{ node: any }> }
          }
        }>
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
      }
    }>(query, variables)

    return {
      products: data.products.edges.map((e) => ({
        ...e.node,
        // normalize variants to an array like your old code
        variants: e.node.variants?.edges?.map((v) => v.node) ?? [],
      })),
      hasNextPage: data.products.pageInfo.hasNextPage,
      endCursor: data.products.pageInfo.endCursor,
    }
  } catch (err) {
    console.error("getProductsPage failed:", err)
    return { products: [], hasNextPage: false, endCursor: null }
  }
}

export async function getShopFilters(): Promise<{
  productTypes: string[]
  vendors: string[]
  priceRange: { min: number; max: number }
}> {
  // Pull "faceted" filter values from ProductConnection.filters :contentReference[oaicite:5]{index=5}
  // And compute price min/max cheaply by grabbing 1 product at each extreme.
  const query = `
    query ShopFilters {
      base: products(first: 1) {
        filters {
          id
          label
          type
          values { label }
        }
      }
      minP: products(first: 1, sortKey: PRICE, reverse: false) {
        nodes { priceRange { minVariantPrice { amount } } }
      }
      maxP: products(first: 1, sortKey: PRICE, reverse: true) {
        nodes { priceRange { maxVariantPrice { amount } } }
      }
    }
  `

  try {
    const data = await shopifyFetch<{
      base: { filters: Array<{ id: string; label: string; type: string; values: Array<{ label: string }> }> }
      minP: { nodes: Array<{ priceRange: { minVariantPrice: { amount: string } } }> }
      maxP: { nodes: Array<{ priceRange: { maxVariantPrice: { amount: string } } }> }
    }>(query, {})

    const filters = data.base.filters ?? []

    const typeFilter =
      filters.find((f) => f.id.toLowerCase().includes("product_type")) ??
      filters.find((f) => f.label.toLowerCase().includes("type"))

    const vendorFilter =
      filters.find((f) => f.id.toLowerCase().includes("vendor")) ??
      filters.find((f) => f.label.toLowerCase().includes("vendor")) ??
      filters.find((f) => f.label.toLowerCase().includes("brand"))

    const productTypes = Array.from(new Set((typeFilter?.values ?? []).map((v) => v.label))).sort()
    const vendors = Array.from(new Set((vendorFilter?.values ?? []).map((v) => v.label))).sort()

    const min = Number.parseFloat(data.minP.nodes?.[0]?.priceRange?.minVariantPrice?.amount ?? "0")
    const max = Number.parseFloat(data.maxP.nodes?.[0]?.priceRange?.maxVariantPrice?.amount ?? "0")

    return {
      productTypes,
      vendors,
      priceRange: {
        min: Number.isFinite(min) ? min : 0,
        max: Number.isFinite(max) ? max : 0,
      },
    }
  } catch (err) {
    console.error("getShopFilters failed:", err)
    return { productTypes: [], vendors: [], priceRange: { min: 0, max: 0 } }
  }
}

declare function shopifyFetch<T>(query: string, variables: Record<string, any>): Promise<T>

export async function getProductFilters(): Promise<{
  productTypes: string[]
  vendors: string[]
  priceRange: { min: number; max: number }
}> {
  try {
    const query = `
      query GetProductFilters {
        products(first: 250) {
          edges {
            node {
              productType
              vendor
              priceRange {
                minVariantPrice {
                  amount
                }
                maxVariantPrice {
                  amount
                }
              }
            }
          }
        }
      }
    `

    const data = await shopifyFetch<{
      products: {
        edges: Array<{
          node: {
            productType: string
            vendor: string
            priceRange: {
              minVariantPrice: { amount: string }
              maxVariantPrice: { amount: string }
            }
          }
        }>
      }
    }>(query)

    const productTypes = new Set<string>()
    const vendors = new Set<string>()
    let minPrice = Number.POSITIVE_INFINITY
    let maxPrice = 0

    data.products.edges.forEach((edge) => {
      if (edge.node.productType) productTypes.add(edge.node.productType)
      if (edge.node.vendor) vendors.add(edge.node.vendor)

      const min = Number.parseFloat(edge.node.priceRange.minVariantPrice.amount)
      const max = Number.parseFloat(edge.node.priceRange.maxVariantPrice.amount)

      if (min < minPrice) minPrice = min
      if (max > maxPrice) maxPrice = max
    })

    return {
      productTypes: Array.from(productTypes).sort(),
      vendors: Array.from(vendors).sort(),
      priceRange: {
        min: minPrice === Number.POSITIVE_INFINITY ? 0 : minPrice,
        max: maxPrice || 100,
      },
    }
  } catch (error) {
    console.error("Failed to fetch product filters from Shopify:", error)
    return { productTypes: [], vendors: [], priceRange: { min: 0, max: 100 } }
  }
}
