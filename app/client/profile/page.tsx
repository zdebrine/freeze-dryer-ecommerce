import { createClient } from "@/lib/supabase/server"
import { UpdateProfileForm } from "@/components/client/update-profile-form"

export default async function ClientProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account and shipping information</p>
      </div>

      <UpdateProfileForm profile={profile} />
    </div>
  )
}
