import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"
import { notFound, redirect } from "next/navigation"
import { OrderConfirmation } from "@/components/admin/order-confirmation"
import { PackageReceivedButton } from "@/components/admin/package-received-button"
import { CreateShopifyCheckoutButton } from "@/components/admin/create-shopify-checkout-button"
import { EnhancedOrderHistory } from "@/components/admin/enhanced-order-history"
import { OrderWorkflowStage } from "@/components/admin/order-workflow-stage"

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

  const { data: signoffs } = await supabase
    .from("order_signoffs")
    .select("*")
    .eq("order_id", id)
    .order("signed_at", { ascending: true })

  const { data: logs } = await supabase
    .from("order_logs")
    .select(
      `
      *,
      profiles!order_logs_user_id_fkey (full_name)
    `,
    )
    .eq("order_id", id)
    .order("created_at", { ascending: false })

  const { data: machines } = await supabase.from("machines").select("*")

  const currentStatus = order.unified_status || order.status

  const needsConfirmation = currentStatus === "pending_confirmation"
  const needsPackageConfirmation = currentStatus === "awaiting_shipment"
  const inWorkflowStage = ["pre_freeze_prep", "waiting_for_freeze_dryer", "freeze_drying", "final_packaging"].includes(
    currentStatus,
  )
  const canCreateShopifyCheckout = currentStatus === "ready_for_payment" && !order.shopify_checkout_url

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{order.order_number}</h1>
        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
          {currentStatus.replace(/_/g, " ")}
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
            <CardTitle>Awaiting Package</CardTitle>
            <CardDescription>
              {order.tracking_number
                ? `Client provided tracking: ${order.tracking_number}. Mark as received when package arrives.`
                : "Waiting for client to ship their coffee. Mark as received when package arrives."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PackageReceivedButton orderId={order.id} />
          </CardContent>
        </Card>
      )}

      {inWorkflowStage && (
        <OrderWorkflowStage orderId={order.id} currentStatus={currentStatus} order={order} machines={machines || []} />
      )}

      {canCreateShopifyCheckout && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle>Order Complete - Create Checkout</CardTitle>
            <CardDescription>
              The order is packaged and ready. Create a Shopify checkout to send to the client.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {order.total_packaging_cost && (
              <div className="mb-4 rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">Total Order Cost: ${order.total_packaging_cost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Packaging: {order.packaging_type?.replace("_", " ")}
                  {order.bulk_bags_count && ` - ${order.bulk_bags_count} bags`}
                  {order.sachet_boxes_count && ` - ${order.sachet_boxes_count} boxes`}
                </p>
              </div>
            )}
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
              <p className="text-sm text-muted-foreground">Lot Number</p>
              <p className="font-medium font-mono">{order.lot_number || "Not assigned"}</p>
            </div>
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
            {order.packaging_type && (
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">Packaging</p>
                <p className="font-medium capitalize">{order.packaging_type.replace(/_/g, " ")}</p>
                {order.bulk_bags_count && <p className="text-sm">{order.bulk_bags_count} × 100g bags</p>}
                {order.sachet_boxes_count && <p className="text-sm">{order.sachet_boxes_count} × 6-pack boxes</p>}
                {order.custom_packaging_description && <p className="text-sm">{order.custom_packaging_description}</p>}
                {order.total_packaging_cost && (
                  <p className="text-sm font-semibold">Total: ${order.total_packaging_cost.toFixed(2)}</p>
                )}
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

      <EnhancedOrderHistory
        logs={logs || []}
        signoffs={signoffs || []}
        weightData={{
          beans_input_weight_kg: order.beans_input_weight_kg,
          concentrate_output_weight_kg: order.concentrate_output_weight_kg,
          concentrate_input_weight_kg: order.concentrate_input_weight_kg,
          powder_output_weight_kg: order.powder_output_weight_kg,
          beans_to_concentrate_yield_percent: order.beans_to_concentrate_yield_percent,
          concentrate_to_powder_yield_percent: order.concentrate_to_powder_yield_percent,
        }}
      />
    </div>
  )
}
