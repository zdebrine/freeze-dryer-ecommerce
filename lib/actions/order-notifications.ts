"use server"

import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/send-email"
import {
  getOrderConfirmationEmail,
  getPackageReceivedEmail,
  getProcessingStageEmail,
  getPaymentReadyEmail,
  getPaymentConfirmedEmail,
  getTrackingSubmittedEmail,
} from "@/lib/email/templates"

export async function sendOrderConfirmationNotification(orderId: string) {
  const supabase = await createClient()

  const { data: order } = await supabase
    .from("orders")
    .select("*, profiles!orders_assigned_admin_id_fkey(*)")
    .eq("id", orderId)
    .single()

  if (!order || !order.profiles) return { success: false }

  const adminProfile = order.profiles
  if (!adminProfile.shipping_address_line1) {
    console.error("[v0] Admin has no shipping address")
    return { success: false }
  }

  const emailTemplate = getOrderConfirmationEmail(order.client_name || "Customer", order.order_number, {
    line1: adminProfile.shipping_address_line1,
    line2: adminProfile.shipping_address_line2 || undefined,
    city: adminProfile.shipping_city || "",
    state: adminProfile.shipping_state || "",
    postalCode: adminProfile.shipping_postal_code || "",
  })

  return sendEmail(order.client_email, emailTemplate.subject, emailTemplate.html, emailTemplate.text)
}

export async function sendPackageReceivedNotification(orderId: string) {
  const supabase = await createClient()

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (!order) return { success: false }

  const emailTemplate = getPackageReceivedEmail(order.client_name || "Customer", order.order_number)

  return sendEmail(order.client_email, emailTemplate.subject, emailTemplate.html, emailTemplate.text)
}

export async function sendProcessingStageNotification(orderId: string, stage: string) {
  const supabase = await createClient()

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (!order) return { success: false }

  const stageDescriptions: Record<string, string> = {
    pre_freeze: "Your coffee is being prepared and arranged in the freeze dryer.",
    freezing: "The freeze-drying cycle is now in progress. This typically takes 24-48 hours.",
    post_freeze: "Freeze-drying is complete! We're now processing and quality checking your coffee.",
    packaging: "Your coffee is being carefully packaged for final delivery preparation.",
  }

  const emailTemplate = getProcessingStageEmail(
    order.client_name || "Customer",
    order.order_number,
    stage,
    stageDescriptions[stage] || "Your order is progressing through our facility.",
  )

  return sendEmail(order.client_email, emailTemplate.subject, emailTemplate.html, emailTemplate.text)
}

export async function sendPaymentReadyNotification(orderId: string, checkoutUrl: string) {
  const supabase = await createClient()

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (!order) return { success: false }

  const emailTemplate = getPaymentReadyEmail(
    order.client_name || "Customer",
    order.order_number,
    checkoutUrl,
    order.quantity_kg,
  )

  return sendEmail(order.client_email, emailTemplate.subject, emailTemplate.html, emailTemplate.text)
}

export async function sendPaymentConfirmedNotification(orderId: string, trackingNumber?: string) {
  const supabase = await createClient()

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (!order) return { success: false }

  const emailTemplate = getPaymentConfirmedEmail(order.client_name || "Customer", order.order_number, trackingNumber)

  return sendEmail(order.client_email, emailTemplate.subject, emailTemplate.html, emailTemplate.text)
}

export async function sendTrackingSubmittedNotification(orderId: string) {
  const supabase = await createClient()

  const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

  if (orderError) {
    console.error("[v0] Error fetching order:", orderError)
    return { success: false }
  }

  if (!order) {
    console.error("[v0] Order not found")
    return { success: false }
  }

  let adminEmail: string | null = null
  let adminName: string | null = null

  // Try to get admin from assigned_admin_id
  if (order.assigned_admin_id) {
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", order.assigned_admin_id)
      .single()

    if (adminProfile) {
      adminEmail = adminProfile.email
      adminName = adminProfile.full_name
    }
  }

  // Fallback: Try to find an admin associated with this client
  if (!adminEmail && order.client_id) {
    const { data: adminClient } = await supabase
      .from("admin_clients")
      .select("admin_id")
      .eq("client_id", order.client_id)
      .limit(1)
      .single()

    if (adminClient?.admin_id) {
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", adminClient.admin_id)
        .single()

      if (adminProfile) {
        adminEmail = adminProfile.email
        adminName = adminProfile.full_name

        // Update the order with the found admin
        await supabase.from("orders").update({ assigned_admin_id: adminClient.admin_id }).eq("id", orderId)
      }
    }
  }

  if (!adminEmail) {
    console.error("[v0] No admin email found for notification")
    // Don't fail - just return success to not block the tracking update
    return { success: true }
  }

  if (!order.tracking_number) {
    console.error("[v0] No tracking number found on order")
    return { success: false }
  }

  const emailTemplate = getTrackingSubmittedEmail(
    adminName || "Admin",
    order.order_number,
    order.client_name || "Customer",
    order.tracking_number,
  )

  return sendEmail(adminEmail, emailTemplate.subject, emailTemplate.html, emailTemplate.text)
}
