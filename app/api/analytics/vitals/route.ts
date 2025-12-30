import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, value, rating, id, label } = body

    // Log the web vital metric
    console.log("[Analytics] Web Vital:", {
      name,
      value,
      rating,
      id,
      label,
      timestamp: new Date().toISOString(),
    })

    // Here you could send this data to your analytics service
    // Examples:
    // - Google Analytics
    // - Mixpanel
    // - Custom analytics endpoint
    // - Database storage

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Analytics] Error processing web vital:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
