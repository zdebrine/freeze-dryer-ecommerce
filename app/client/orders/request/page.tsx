import { RequestOrderForm } from "@/components/client/request-order-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RequestOrderPage() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Request New Order</h1>
        <p className="text-muted-foreground">Submit a new coffee freeze-drying order request</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Provide the details for your order request</CardDescription>
        </CardHeader>
        <CardContent>
          <RequestOrderForm />
        </CardContent>
      </Card>
    </div>
  )
}
