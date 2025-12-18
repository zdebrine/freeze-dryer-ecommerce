import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { TrackingNumberForm } from "@/components/client/tracking-number-form"

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
}

export default async function ClientOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      *,
      machines (machine_name, machine_code, capacity_kg)
    `,
    )
    .eq("id", id)
    .eq("client_id", user?.id)
    .single()

  if (!order) {
    notFound()
  }

  // Fetch order logs
  const { data: logs } = await supabase
    .from("order_logs")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: false })

  const needsTracking = order.order_stage === "awaiting_shipment" && !order.tracking_number
  const needsPayment = order.order_stage === "payment_pending" && order.shopify_checkout_url

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/client">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{order.order_number}</h1>
        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
          {order.status.replace("_", " ")}
        </Badge>
      </div>

      {needsTracking && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle>Action Required: Add Tracking Number</CardTitle>
            <CardDescription>
              Your order has been confirmed. Please ship your coffee and provide the tracking number below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrackingNumberForm orderId={order.id} />
          </CardContent>
        </Card>
      )}

      {needsPayment && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle>Payment Ready</CardTitle>
            <CardDescription>Your freeze-dried coffee is ready! Complete payment to have it shipped.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href={order.shopify_checkout_url} target="_blank" rel="noopener noreferrer">
                Complete Payment
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Information about your order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">Coffee Type</p>
              <p className="font-medium">{order.coffee_type}</p>
            </div>
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-medium">{order.quantity_kg} kg</p>
            </div>
            {order.roast_level && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Roast Level</p>
                <p className="font-medium capitalize">{order.roast_level}</p>
              </div>
            )}
            {order.grind_size && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Grind Size</p>
                <p className="font-medium capitalize">{order.grind_size}</p>
              </div>
            )}
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">{new Date(order.order_date).toLocaleDateString()}</p>
            </div>
            {order.requested_completion_date && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Requested Completion Date</p>
                <p className="font-medium">{new Date(order.requested_completion_date).toLocaleDateString()}</p>
              </div>
            )}
            {order.actual_completion_date && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Completed On</p>
                <p className="font-medium">{new Date(order.actual_completion_date).toLocaleDateString()}</p>
              </div>
            )}
            {order.special_instructions && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Special Instructions</p>
                <p className="font-medium">{order.special_instructions}</p>
              </div>
            )}
            {order.tracking_number && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Tracking Number</p>
                <p className="font-medium font-mono">{order.tracking_number}</p>
                {order.tracking_confirmed_at && (
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(order.tracking_confirmed_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}
            {order.order_stage && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Processing Stage</p>
                <Badge variant="outline" className="w-fit capitalize">
                  {order.order_stage.replace(/_/g, " ")}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Machine Information */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Information</CardTitle>
            <CardDescription>Machine and processing details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.machines ? (
              <>
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">Assigned Machine</p>
                  <p className="font-medium">{order.machines.machine_name}</p>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">Machine Code</p>
                  <p className="font-medium">{order.machines.machine_code}</p>
                </div>
                <div className="grid gap-2">
                  <p className="text-sm text-muted-foreground">Machine Capacity</p>
                  <p className="font-medium">{order.machines.capacity_kg} kg</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No machine assigned yet</p>
                <p className="text-xs text-muted-foreground">We will assign a machine once your order is confirmed</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Timeline */}
      {logs && logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
            <CardDescription>Track the progress of your order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 border-l-2 border-muted pl-4">
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{log.action}</p>
                    {log.notes && <p className="text-sm text-muted-foreground">{log.notes}</p>}
                    {log.new_status && (
                      <Badge variant="outline" className="text-xs">
                        {log.new_status.replace("_", " ")}
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
