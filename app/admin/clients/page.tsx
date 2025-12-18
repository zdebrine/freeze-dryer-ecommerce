import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function ClientsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in</div>
  }

  const { data: adminClientRelations, error } = await supabase
    .from("admin_clients")
    .select(
      `
      client_id,
      profiles!admin_clients_client_id_fkey(
        id,
        full_name,
        email,
        company_name,
        phone,
        role,
        created_at
      )
    `,
    )
    .eq("admin_id", user.id)
    .order("created_at", { ascending: false })

    const ids = adminClientRelations?.map((r) => r.client_id) ?? []

const { data: profiles, error: pErr } = await supabase
  .from("profiles")
  .select("id, full_name, email")
  .in("id", ids)

console.log("profiles check", { profiles, pErr })

  console.log("[v0] Admin client relations:", adminClientRelations)
  console.log("[v0] Query error:", error)

  // Extract client profiles from the relations
  const clients = adminClientRelations?.map((relation: any) => relation.profiles).filter(Boolean) || []

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client accounts</p>
        </div>
        <Link href="/admin/clients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Clients</CardTitle>
          <CardDescription>View and manage client information</CardDescription>
        </CardHeader>
        <CardContent>
          {!clients || clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No clients yet</p>
              <p className="text-sm text-muted-foreground mt-2">Create a new client to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map((client: any) => (
                <div key={client.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <p className="font-semibold">{client.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {client.email}
                      {client.company_name && ` • ${client.company_name}`}
                    </p>
                  </div>
                  <Badge variant="outline">Client</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
