import { createClient } from "@/lib/supabase/server"
import { AcceptInvitationForm } from "@/components/admin/accept-invitation-form"

interface PageProps {
  params: {
    token: string
  }
}

export default async function AcceptInvitationPage({ params }: PageProps) {
  const { token } = params
  const supabase = await createClient()

  // Check if invitation exists and is valid
  const { data: invitation } = await supabase
    .from("team_invitations")
    .select("*, profiles!team_invitations_invited_by_fkey(full_name, company_name)")
    .eq("token", token)
    .eq("status", "pending")
    .single()

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold">Invalid Invitation</h1>
          <p className="text-muted-foreground">
            This invitation link is invalid or has already been used. Please contact your administrator for a new
            invitation.
          </p>
        </div>
      </div>
    )
  }

  // Check if invitation has expired
  const expiresAt = new Date(invitation.expires_at)
  if (expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold">Invitation Expired</h1>
          <p className="text-muted-foreground">
            This invitation has expired. Please contact your administrator for a new invitation.
          </p>
        </div>
      </div>
    )
  }

  const inviterName = invitation.profiles?.full_name || "Your administrator"
  const companyName = invitation.profiles?.company_name || "the organization"

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Join the Team</h1>
          <p className="text-muted-foreground">
            {inviterName} has invited you to join {companyName} as a team member.
          </p>
        </div>
        <AcceptInvitationForm invitation={invitation} />
      </div>
    </div>
  )
}
