import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

export async function RecentOrders() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      profiles!orders_client_id_fkey (full_name, company_name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5)

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No orders yet</p>
        <Button asChild className="mt-4" size="sm">
          <Link href="/admin/orders">View All Orders</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <p className="font-semibold">{order.order_number}</p>
                <Badge className={statusColors[order.status as keyof typeof statusColors]}>{order.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {order.profiles?.full_name} • {order.coffee_type} • {order.quantity_kg}kg
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/admin/orders/${order.id}/view`}>
                View
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
      <Button asChild variant="outline" className="w-full bg-transparent">
        <Link href="/admin/orders">View All Orders</Link>
      </Button>
    </div>
  )
}
