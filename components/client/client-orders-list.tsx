import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const statusConfig = {
  pending_confirmation: {
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    label: "Pending Confirmation",
  },
  awaiting_shipment: {
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    label: "Confirmed: Awaiting Shipment",
  },
  package_received: { color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20", label: "Package Received" },
  pre_freeze_prep: {
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    label: "In Progress: Pre-Freeze Prep",
  },
  freeze_drying: {
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    label: "In Progress: Freeze Drying",
  },
  final_packaging: { color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", label: "Final Packaging" },
  ready_for_payment: { color: "bg-green-500/10 text-green-600 border-green-500/20", label: "Ready For Payment" },
  completed: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "Completed" },
}

export async function ClientOrdersList({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      machines (machine_name, machine_code)
    `,
    )
    .eq("client_id", userId)
    .order("created_at", { ascending: false })

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">No orders yet</p>
        <p className="text-sm text-muted-foreground">Contact us to place your first order</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const currentStatus = order.unified_status || "pending_confirmation"
        const statusInfo = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.pending_confirmation

        return (
          <div
            key={order.id}
            className="flex flex-col gap-3 rounded-lg border p-4 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <p className="font-semibold">{order.order_number}</p>
                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {order.coffee_type} • {order.quantity_kg}kg
              </p>
              <p className="text-xs text-muted-foreground">
                Ordered on {new Date(order.order_date).toLocaleDateString()}
                {order.machines && (
                  <span className="hidden sm:inline"> • Processing on {order.machines.machine_name}</span>
                )}
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto">
              <Link href={`/client/orders/${order.id}`}>
                View
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )
      })}
    </div>
  )
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}
