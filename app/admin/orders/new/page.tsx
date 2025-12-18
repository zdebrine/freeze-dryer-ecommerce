import { CreateOrderForm } from "@/components/admin/create-order-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewOrderPage() {
  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>
        <p className="text-muted-foreground">Add a new coffee freeze-drying order</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Fill in the information below to create a new order</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrderForm />
        </CardContent>
      </Card>
    </div>
  )
}
