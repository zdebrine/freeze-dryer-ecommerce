import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"
import { notFound, redirect } from "next/navigation"
import { OrderStatusUpdate } from "@/components/admin/order-status-update"
import { OrderLogs } from "@/components/admin/order-logs"
import { OrderConfirmation } from "@/components/admin/order-confirmation"
import { PackageReceivedButton } from "@/components/admin/package-received-button"
import { CreateShopifyCheckoutButton } from "@/components/admin/create-shopify-checkout-button"

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === "new") {
    redirect("/admin/orders/new")
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  const supabase = await createClient()

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      *,
      profiles!orders_client_id_fkey (id, full_name, company_name, email, phone),
      machines (id, machine_name, machine_code),
      assigned_admin:profiles!orders_assigned_admin_id_fkey (id, full_name, email)
    `,
    )
    .eq("id", id)
    .single()

  if (!order) {
    notFound()
  }

  const needsConfirmation = order.status === "pending" && !order.order_stage
  const needsPackageConfirmation = order.tracking_number && !order.package_received
  const canCreateShopifyCheckout =
    order.status === "completed" && !order.shopify_checkout_url && order.order_stage !== "payment_pending"

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/orders/${id}/edit-order`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Order
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{order.order_number}</h1>
        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
          {order.status.replace("_", " ")}
        </Badge>
      </div>

      {needsConfirmation && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle>New Order - Action Required</CardTitle>
            <CardDescription>A client has requested a new order. Review and confirm to proceed.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderConfirmation orderId={order.id} />
          </CardContent>
        </Card>
      )}

      {needsPackageConfirmation && (
        <Card className="border-amber-500">
          <CardHeader>
            <CardTitle>Package In Transit</CardTitle>
            <CardDescription>
              Client has provided tracking number: <span className="font-mono font-bold">{order.tracking_number}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PackageReceivedButton orderId={order.id} />
          </CardContent>
        </Card>
      )}

      {canCreateShopifyCheckout && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle>Order Complete - Create Checkout</CardTitle>
            <CardDescription>The order is ready. Create a Shopify checkout to send to the client.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateShopifyCheckoutButton orderId={order.id} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Information about this order</CardDescription>
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
            {order.requested_completion_date && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Requested Completion Date</p>
                <p className="font-medium">{new Date(order.requested_completion_date).toLocaleDateString()}</p>
              </div>
            )}
            {order.special_instructions && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Special Instructions</p>
                <p className="font-medium">{order.special_instructions}</p>
              </div>
            )}
            {order.machines && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Assigned Machine</p>
                <p className="font-medium">
                  {order.machines.machine_name} ({order.machines.machine_code})
                </p>
              </div>
            )}
            {order.assigned_admin && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Assigned Admin</p>
                <p className="font-medium">{order.assigned_admin.full_name}</p>
              </div>
            )}
            {order.tracking_number && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Tracking Number</p>
                <p className="font-medium font-mono">{order.tracking_number}</p>
                {order.tracking_confirmed_at && (
                  <p className="text-xs text-muted-foreground">
                    Received: {new Date(order.tracking_confirmed_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}
            {order.package_received && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Package Status</p>
                <Badge variant="outline" className="w-fit">
                  Received{" "}
                  {order.package_received_at && `on ${new Date(order.package_received_at).toLocaleDateString()}`}
                </Badge>
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
            {order.shopify_checkout_url && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Shopify Checkout</p>
                <a
                  href={order.shopify_checkout_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Checkout Link
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Details about the client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{order.client_name || order.profiles?.full_name || "N/A"}</p>
            </div>
            {(order.client_company || order.profiles?.company_name) && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-medium">{order.client_company || order.profiles?.company_name}</p>
              </div>
            )}
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{order.client_email || order.profiles?.email || "N/A"}</p>
            </div>
            {(order.client_phone || order.profiles?.phone) && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.client_phone || order.profiles?.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Update */}
      <Card>
        <CardHeader>
          <CardTitle>Update Status & Processing Stage</CardTitle>
          <CardDescription>Change the order status, stage, and add notes</CardDescription>
        </CardHeader>
        <CardContent>
          <OrderStatusUpdate
            orderId={id}
            currentStatus={order.status}
            currentMachineId={order.machine_id}
            currentStage={order.order_stage}
          />
        </CardContent>
      </Card>

      {/* Order Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Timeline of status changes and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <OrderLogs orderId={id} />
        </CardContent>
      </Card>
    </div>
  )
}
