import { createClient } from "@/lib/supabase/server"
import { EditOrderForm } from "@/components/admin/edit-order-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export default async function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).single()

  if (!order) {
    notFound()
  }

  // Fetch clients, machines, and admins for the form
  const { data: clients } = await supabase.from("profiles").select("id, full_name, company_name").eq("role", "client")

  const { data: machines } = await supabase.from("machines").select("id, machine_name, machine_code")

  const { data: admins } = await supabase.from("profiles").select("id, full_name").eq("role", "admin")

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/admin/orders/${id}/view`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Order
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Order</h1>
        <p className="text-muted-foreground">Update order information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Update the information below</CardDescription>
        </CardHeader>
        <CardContent>
          <EditOrderForm order={order} clients={clients || []} machines={machines || []} admins={admins || []} />
        </CardContent>
      </Card>
    </div>
  )
}
