import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientNav } from "@/components/client/client-nav"

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is client
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "client") {
    redirect("/admin")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ClientNav />
      <main className="flex-1 bg-muted/10">{children}</main>
    </div>
  )
}
