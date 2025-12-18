import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { OrdersTable } from "@/components/admin/orders-table"

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase.from("orders").select(
    `
      *,
      profiles!orders_client_id_fkey (full_name, company_name, email),
      machines (machine_name, machine_code)
    `,
  )

  if (params.search) {
    query = query.or(`order_number.ilike.%${params.search}%,coffee_type.ilike.%${params.search}%`)
  }

  if (params.status) {
    query = query.eq("status", params.status)
  }

  const { data: orders } = await query.order("created_at", { ascending: false })

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage all coffee freeze-drying orders</p>
        </div>
        <Button asChild>
          <Link href="/admin/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>View and manage orders from all clients</CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={orders || []} />
        </CardContent>
      </Card>
    </div>
  )
}
