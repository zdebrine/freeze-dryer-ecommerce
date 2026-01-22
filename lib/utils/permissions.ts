import { createClient } from "@/lib/supabase/client"

export async function getUserPermissions() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile) return null

  // Admins have full permissions
  if (profile.role === "admin") {
    return {
      role: "admin" as const,
      can_view_orders: true,
      can_update_orders: true,
      can_sign_off: true,
      can_create_invoices: true,
      can_complete_orders: true,
    }
  }

  // Employees have limited permissions
  if (profile.role === "employee") {
    const { data: permissions } = await supabase
      .from("employee_permissions")
      .select("*")
      .eq("employee_id", user.id)
      .single()

    return {
      role: "employee" as const,
      can_view_orders: permissions?.can_view_orders ?? true,
      can_update_orders: permissions?.can_update_orders ?? true,
      can_sign_off: permissions?.can_sign_off ?? true,
      can_create_invoices: false, // Always false for employees
      can_complete_orders: false, // Always false for employees
    }
  }

  // Clients have no admin permissions
  return {
    role: "client" as const,
    can_view_orders: false,
    can_update_orders: false,
    can_sign_off: false,
    can_create_invoices: false,
    can_complete_orders: false,
  }
}

export async function canCreateInvoice(): Promise<boolean> {
  const permissions = await getUserPermissions()
  return permissions?.can_create_invoices ?? false
}

export async function canCompleteOrder(): Promise<boolean> {
  const permissions = await getUserPermissions()
  return permissions?.can_complete_orders ?? false
}

export async function canSignOff(): Promise<boolean> {
  const permissions = await getUserPermissions()
  return permissions?.can_sign_off ?? false
}
