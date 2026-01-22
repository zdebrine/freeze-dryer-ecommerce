import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email/send-email"
import { getTeamInvitationEmail } from "@/lib/email/templates"

export async function POST(request: Request) {
  try {
    const { to, inviterName, inviteLink } = await request.json()

    if (!to || !inviterName || !inviteLink) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Extract name from email for personalization
    const inviteeName = to.split("@")[0]

    const emailTemplate = getTeamInvitationEmail(inviteeName, inviterName, inviteLink)

    const result = await sendEmail(to, emailTemplate.subject, emailTemplate.html, emailTemplate.text)

    if (!result.success) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in send-team-invitation API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
