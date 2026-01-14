import { createClient } from "@/lib/supabase/server"
import { UpdateAdminProfileForm } from "@/components/admin/update-admin-profile-form"
import { TeamMembersSection } from "@/components/admin/team-members-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  const { data: teamMembers } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .eq("role", "employee")
    .order("created_at", { ascending: false })

  const { data: invitations } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
  // </CHANGE>

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and team</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile & Shipping</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <UpdateAdminProfileForm profile={profile} />
        </TabsContent>

        <TabsContent value="team">
          <TeamMembersSection teamMembers={teamMembers || []} invitations={invitations || []} />
        </TabsContent>
      </Tabs>
      {/* </CHANGE> */}
    </div>
  )
}
