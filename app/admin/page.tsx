import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Cog, TrendingUp } from "lucide-react"
import { RecentOrders } from "@/components/admin/recent-orders"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch statistics
  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: inProgressOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "in_progress")

  const { count: availableMachines } = await supabase
    .from("machines")
    .select("*", { count: "exact", head: true })
    .eq("status", "available")

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders || 0,
      icon: ShoppingCart,
      description: "All-time orders",
    },
    {
      title: "Pending Orders",
      value: pendingOrders || 0,
      icon: Package,
      description: "Awaiting confirmation",
    },
    {
      title: "In Progress",
      value: inProgressOrders || 0,
      icon: TrendingUp,
      description: "Currently processing",
    },
    {
      title: "Available Machines",
      value: availableMachines || 0,
      icon: Cog,
      description: "Ready for use",
    },
  ]

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your coffee freeze-drying operations</p>
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

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from clients</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentOrders />
        </CardContent>
      </Card>
    </div>
  )
}
