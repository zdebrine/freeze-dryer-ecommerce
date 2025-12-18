import { type NextRequest, NextResponse } from "next/server"
import { sendTrackingSubmittedNotification } from "@/lib/actions/order-notifications"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const result = await sendTrackingSubmittedNotification(orderId)

    if (!result.success) {
      return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in tracking notification API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
