// Shopify API client configuration
const SHOPIFY_STORE = process.env.SHOPIFY_STORE_NAME
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
const SHOPIFY_API_VERSION = "2024-01"

export async function createShopifyDraftOrder(orderData: {
  orderId: string
  clientEmail: string
  clientName: string
  quantity: number
  coffeeType: string
  orderNumber: string
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}) {
  if (!SHOPIFY_STORE || !SHOPIFY_ACCESS_TOKEN) {
    throw new Error("Shopify configuration missing. Please set SHOPIFY_STORE_NAME and SHOPIFY_ADMIN_ACCESS_TOKEN.")
  }

  const shopifyEndpoint = `https://${SHOPIFY_STORE}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/draft_orders.json`

  const nameParts = orderData.clientName.split(" ")
  const firstName = nameParts[0] || ""
  const lastName = nameParts.slice(1).join(" ") || ""

  // Calculate price based on quantity (adjust pricing as needed)
  const pricePerKg = 50
  const totalPrice = (orderData.quantity * pricePerKg).toFixed(2)

  const draftOrderPayload = {
    draft_order: {
      line_items: [
        {
          title: `Freeze-Dried Coffee - ${orderData.coffeeType}`,
          price: "0.00",
          quantity: 1,
          requires_shipping: true,
          taxable: false,
        },
      ],
      customer: {
        email: orderData.clientEmail,
        first_name: firstName,
        last_name: lastName,
      },
      shipping_address: {
        address1: orderData.shippingAddress.line1,
        address2: orderData.shippingAddress.line2,
        city: orderData.shippingAddress.city,
        province: orderData.shippingAddress.state,
        zip: orderData.shippingAddress.postalCode,
        country: orderData.shippingAddress.country,
      },
      shipping_line: {
  title: "Free Shipping",
  price: "0.00",
  handle: null,
},
      note: `Order #${orderData.orderNumber} - ${orderData.quantity}kg freeze-dried ${orderData.coffeeType}`,
      use_customer_default_address: false,
    },
  }

  const response = await fetch(shopifyEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
    body: JSON.stringify(draftOrderPayload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] Shopify API Error:", errorText)
    throw new Error(`Shopify API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return {
    draftOrderId: data.draft_order.id.toString(),
    invoiceUrl: data.draft_order.invoice_url,
    draftOrder: data.draft_order,
  }
}

export async function getShopifyOrder(orderId: string) {
  if (!SHOPIFY_STORE || !SHOPIFY_ACCESS_TOKEN) {
    throw new Error("Shopify configuration missing")
  }

  const shopifyEndpoint = `https://${SHOPIFY_STORE}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/orders/${orderId}.json`

  const response = await fetch(shopifyEndpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Shopify order: ${response.status}`)
  }

  const data = await response.json()
  return data.order
}
