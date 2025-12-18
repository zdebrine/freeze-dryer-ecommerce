"use server"

import { createClient } from "@/lib/supabase/server"

// Email sending utility - uses a simple API route for now
// In production, integrate with services like Resend, SendGrid, or Postmark

export async function sendEmail(to: string, subject: string, html: string, text: string) {
  try {
    // For development: Log emails to console
    console.log("[v0] Email would be sent:")
    console.log("To:", to)
    console.log("Subject:", subject)
    console.log("Text:", text)

    // TODO: Integrate with email service provider
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'orders@yourdomain.com',
    //   to,
    //   subject,
    //   html,
    //   text
    // })

    return { success: true }
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return { success: false, error }
  }
}

export async function sendOrderConfirmationEmail(
  orderId: string,
  clientEmail: string,
  clientName: string,
  orderNumber: string,
) {
  // Get admin's shipping address
  const supabase = await createClient()

  // Get the assigned admin's profile for shipping address
  const { data: order } = await supabase.from("orders").select("assigned_admin_id").eq("id", orderId).single()

  if (!order?.assigned_admin_id) {
    console.error("[v0] No assigned admin for order")
    return { success: false }
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code")
    .eq("id", order.assigned_admin_id)
    .single()

  if (!adminProfile?.shipping_address_line1) {
    console.error("[v0] Admin has no shipping address configured")
    return { success: false }
  }

  const { getOrderConfirmationEmail } = await import("./templates")
  const emailTemplate = getOrderConfirmationEmail(clientName, orderNumber, {
    line1: adminProfile.shipping_address_line1,
    line2: adminProfile.shipping_address_line2 || undefined,
    city: adminProfile.shipping_city || "",
    state: adminProfile.shipping_state || "",
    postalCode: adminProfile.shipping_postal_code || "",
  })

  return sendEmail(clientEmail, emailTemplate.subject, emailTemplate.html, emailTemplate.text)
}
