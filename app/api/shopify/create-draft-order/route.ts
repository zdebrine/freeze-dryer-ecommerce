import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createShopifyDraftOrder } from "@/lib/shopify/client"
import { sendPaymentReadyNotification } from "@/lib/actions/order-notifications"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { orderId } = await request.json()

    // Get order details
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get client details
    const { data: client } = await supabase.from("profiles").select("*").eq("id", order.client_id).single()

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Try order-level shipping data first (from new columns), then client profile, then placeholder
    const shippingAddress = {
      line1:
        order.shipping_address_line1 ||
        client.shipping_address_line1 ||
        order.client_company ||
        client.company_name ||
        "Address to be provided",
      line2: order.shipping_address_line2 || client.shipping_address_line2 || undefined,
      city: order.shipping_city || client.shipping_city || "City",
      state: order.shipping_state || client.shipping_state || "State",
      postalCode: order.shipping_postal_code || client.shipping_postal_code || "00000",
      country: order.shipping_country || client.shipping_country || "United States",
    }

    // Create Shopify draft order
    const shopifyResult = await createShopifyDraftOrder({
      orderId: order.id,
      clientEmail: order.client_email || client.email,
      clientName: order.client_name || client.full_name || "Customer",
      quantity: order.quantity_kg,
      coffeeType: order.coffee_type,
      orderNumber: order.order_number,
      shippingAddress,
    })

    await supabase
      .from("orders")
      .update({
        shopify_draft_order_id: shopifyResult.draftOrderId,
        shopify_checkout_url: shopifyResult.invoiceUrl,
        unified_status: "ready_for_payment",
        order_stage: "payment_pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    // Create order log
    await supabase.from("order_logs").insert({
      order_id: orderId,
      user_id: user.id,
      action: "Shopify checkout created",
      notes: `Draft order ID: ${shopifyResult.draftOrderId}`,
      previous_status: order.status,
      new_status: order.status,
    })

    // Send email to client with checkout link
    await sendPaymentReadyNotification(orderId, shopifyResult.invoiceUrl)

    return NextResponse.json({
      success: true,
      checkoutUrl: shopifyResult.invoiceUrl,
      draftOrderId: shopifyResult.draftOrderId,
    })
  } catch (error) {
    console.error("[v0] Error creating draft order:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
