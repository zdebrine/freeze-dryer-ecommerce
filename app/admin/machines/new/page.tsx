import { MachineForm } from "@/components/admin/machine-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewMachinePage() {
  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/machines">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Machines
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Machine</h1>
        <p className="text-muted-foreground">Register a new freeze-drying machine</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Machine Details</CardTitle>
          <CardDescription>Fill in the information below to add a new machine</CardDescription>
        </CardHeader>
        <CardContent>
          <MachineForm />
        </CardContent>
      </Card>
    </div>
  )
}
