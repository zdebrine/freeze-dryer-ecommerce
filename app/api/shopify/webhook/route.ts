import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendPaymentConfirmedNotification } from "@/lib/actions/order-notifications"
import crypto from "crypto"

// Verify Shopify webhook signature
function verifyShopifyWebhook(body: string, hmacHeader: string): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret) return false

  const hash = crypto.createHmac("sha256", secret).update(body, "utf8").digest("base64")
  return hash === hmacHeader
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const hmacHeader = request.headers.get("x-shopify-hmac-sha256")

    // Verify webhook authenticity
    if (hmacHeader && !verifyShopifyWebhook(body, hmacHeader)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const webhookData = JSON.parse(body)
    const topic = request.headers.get("x-shopify-topic")

    console.log("[v0] Shopify webhook received:", topic)

    // Handle order paid webhook
    if (topic === "orders/paid") {
      const supabase = await createClient()

      // Find order by Shopify draft order ID or order number
      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .or(`shopify_draft_order_id.eq.${webhookData.id},order_number.eq.${webhookData.name}`)
        .single()

      if (order) {
        // Update order with payment confirmation
        await supabase
          .from("orders")
          .update({
            shopify_order_id: webhookData.id.toString(),
            payment_completed: true,
            payment_completed_at: new Date().toISOString(),
            order_stage: "payment_completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id)

        // Create order log
        await supabase.from("order_logs").insert({
          order_id: order.id,
          action: "Payment completed",
          notes: `Shopify Order ID: ${webhookData.id}`,
          previous_status: order.status,
          new_status: order.status,
        })

        // Send confirmation email
        const trackingNumber = webhookData.fulfillments?.[0]?.tracking_number
        await sendPaymentConfirmedNotification(order.id, trackingNumber)
      }
    }

    // Handle order fulfilled webhook
    if (topic === "orders/fulfilled") {
      const supabase = await createClient()

      const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("shopify_order_id", webhookData.id.toString())
        .single()

      if (order) {
        await supabase
          .from("orders")
          .update({
            order_stage: "shipped_to_customer",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id)

        // Create order log
        await supabase.from("order_logs").insert({
          order_id: order.id,
          action: "Order fulfilled and shipped",
          notes: webhookData.fulfillments?.[0]?.tracking_number
            ? `Tracking: ${webhookData.fulfillments[0].tracking_number}`
            : "Shipped",
          previous_status: order.status,
          new_status: order.status,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
