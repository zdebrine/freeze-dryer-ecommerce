import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/client")
  }

  return (
    <div className="flex min-h-screen pt-16 lg:pt-0">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-muted/10 lg:ml-64">{children}</main>
    </div>
  )
}
