"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Search } from "lucide-react"
import { useRouter } from "next/navigation"

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
}

type Order = {
  id: string
  order_number: string
  coffee_type: string
  quantity_kg: number
  status: string
  order_date: string
  profiles: { full_name: string; company_name: string | null } | null
  machines: { machine_name: string } | null
  assigned_admin?: { full_name: string } | null
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.coffee_type.toLowerCase().includes(search.toLowerCase()) ||
      order.profiles?.full_name.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-3 rounded-lg border p-4 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <p className="font-semibold">{order.order_number}</p>
                  <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                    {order.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {order.profiles?.full_name}
                  {order.profiles?.company_name && ` (${order.profiles.company_name})`} • {order.coffee_type} •{" "}
                  {order.quantity_kg}kg
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.order_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {order.machines && ` • ${order.machines.machine_name}`}
                  {order.assigned_admin && (
                    <span className="hidden sm:inline"> • Assigned to: {order.assigned_admin.full_name}</span>
                  )}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto">
                <Link href={`/admin/orders/${order.id}/view`}>
                  View
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
