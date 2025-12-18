import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Clock, CheckCircle2, Plus } from "lucide-react"
import { ClientOrdersList } from "@/components/client/client-orders-list"
import Link from "next/link"

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
}

export default async function ClientDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user's orders statistics
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user?.id)

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user?.id)
    .in("status", ["pending", "confirmed"])

  const { count: inProgressOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user?.id)
    .eq("status", "in_progress")

  const { count: completedOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user?.id)
    .eq("status", "completed")

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders || 0,
      icon: Package,
      description: "All-time orders",
    },
    {
      title: "Pending",
      value: pendingOrders || 0,
      icon: Clock,
      description: "Awaiting processing",
    },
    {
      title: "In Progress",
      value: inProgressOrders || 0,
      icon: Clock,
      description: "Currently processing",
    },
    {
      title: "Completed",
      value: completedOrders || 0,
      icon: CheckCircle2,
      description: "Finished orders",
    },
  ]

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">Track your coffee freeze-drying orders</p>
        </div>
        <Link href="/client/orders/request">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Request Order
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>View and track all your orders</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientOrdersList userId={user?.id || ""} />
        </CardContent>
      </Card>
    </div>
  )
}
