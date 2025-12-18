import { createClient } from "@/lib/supabase/server"
import { MachineForm } from "@/components/admin/machine-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export default async function EditMachinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: machine } = await supabase.from("machines").select("*").eq("id", id).single()

  if (!machine) {
    notFound()
  }

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
        <h1 className="text-3xl font-bold tracking-tight">Edit Machine</h1>
        <p className="text-muted-foreground">Update machine information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Machine Details</CardTitle>
          <CardDescription>Update the information below</CardDescription>
        </CardHeader>
        <CardContent>
          <MachineForm machine={machine} />
        </CardContent>
      </Card>
    </div>
  )
}
