import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit, Cog } from "lucide-react"

const statusColors = {
  available: "bg-green-500/10 text-green-600 border-green-500/20",
  in_use: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  maintenance: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  offline: "bg-red-500/10 text-red-600 border-red-500/20",
}

export default async function MachinesPage() {
  const supabase = await createClient()

  const { data: machines } = await supabase.from("machines").select("*").order("created_at", { ascending: false })

  // Get machine usage statistics
  const machineStats = await Promise.all(
    (machines || []).map(async (machine) => {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("machine_id", machine.id)
        .eq("status", "in_progress")

      return { ...machine, activeOrders: count || 0 }
    }),
  )

  const { count: availableCount } = await supabase
    .from("machines")
    .select("*", { count: "exact", head: true })
    .eq("status", "available")

  const { count: inUseCount } = await supabase
    .from("machines")
    .select("*", { count: "exact", head: true })
    .eq("status", "in_use")

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Machines</h1>
          <p className="text-muted-foreground">Manage freeze-drying equipment</p>
        </div>
        <Button asChild>
          <Link href="/admin/machines/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Machine
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Machines</CardTitle>
            <Cog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{machines?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Cog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Use</CardTitle>
            <Cog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inUseCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Machines List */}
      <Card>
        <CardHeader>
          <CardTitle>All Machines</CardTitle>
          <CardDescription>View and manage freeze-drying equipment</CardDescription>
        </CardHeader>
        <CardContent>
          {!machineStats || machineStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Cog className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No machines yet</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/admin/machines/new">Add First Machine</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {machineStats.map((machine) => (
                <Card key={machine.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{machine.machine_name}</CardTitle>
                        <CardDescription>{machine.machine_code}</CardDescription>
                      </div>
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/machines/${machine.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className={statusColors[machine.status as keyof typeof statusColors]}>
                        {machine.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Capacity</span>
                      <span className="text-sm font-medium">{machine.capacity_kg} kg</span>
                    </div>
                    {machine.activeOrders > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Active Orders</span>
                        <span className="text-sm font-medium">{machine.activeOrders}</span>
                      </div>
                    )}
                    {machine.notes && <p className="text-xs text-muted-foreground">{machine.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
