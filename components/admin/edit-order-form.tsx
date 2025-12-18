"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { Order } from "@/lib/types/database"

type Client = { id: string; full_name: string; company_name: string | null }
type Machine = { id: string; machine_name: string; machine_code: string }
type Admin = { id: string; full_name: string }

export function EditOrderForm({
  order,
  clients,
  machines,
  admins,
}: {
  order: Order
  clients: Client[]
  machines: Machine[]
  admins: Admin[]
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const machineId = formData.get("machine_id") as string
      const assignedAdminId = formData.get("assigned_admin_id") as string

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          client_id: formData.get("client_id") as string,
          coffee_type: formData.get("coffee_type") as string,
          quantity_kg: Number.parseFloat(formData.get("quantity_kg") as string),
          roast_level: formData.get("roast_level") as string,
          grind_size: formData.get("grind_size") as string,
          special_instructions: formData.get("special_instructions") as string,
          requested_completion_date: formData.get("requested_completion_date") as string,
          machine_id: machineId === "none" ? null : machineId,
          assigned_admin_id: assignedAdminId === "none" ? null : assignedAdminId,
        })
        .eq("id", order.id)

      if (updateError) throw updateError

      router.push(`/admin/orders/${order.id}/view`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_id">Client *</Label>
          <Select name="client_id" defaultValue={order.client_id} required>
            <SelectTrigger id="client_id">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.full_name}
                  {client.company_name && ` (${client.company_name})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coffee_type">Coffee Type *</Label>
          <Input
            id="coffee_type"
            name="coffee_type"
            placeholder="e.g., Arabica"
            defaultValue={order.coffee_type}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity_kg">Quantity (kg) *</Label>
          <Input
            id="quantity_kg"
            name="quantity_kg"
            type="number"
            step="0.01"
            placeholder="50.00"
            defaultValue={order.quantity_kg}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="roast_level">Roast Level</Label>
          <Select name="roast_level" defaultValue={order.roast_level || undefined}>
            <SelectTrigger id="roast_level">
              <SelectValue placeholder="Select roast level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grind_size">Grind Size</Label>
          <Select name="grind_size" defaultValue={order.grind_size || undefined}>
            <SelectTrigger id="grind_size">
              <SelectValue placeholder="Select grind size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coarse">Coarse</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="fine">Fine</SelectItem>
              <SelectItem value="extra-fine">Extra Fine</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requested_completion_date">Requested Completion Date</Label>
          <Input
            id="requested_completion_date"
            name="requested_completion_date"
            type="date"
            defaultValue={order.requested_completion_date || undefined}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="machine_id">Assigned Machine</Label>
          <Select name="machine_id" defaultValue={order.machine_id || "none"}>
            <SelectTrigger id="machine_id">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No machine assigned</SelectItem>
              {machines.map((machine) => (
                <SelectItem key={machine.id} value={machine.id}>
                  {machine.machine_name} ({machine.machine_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assigned_admin_id">Assigned Admin</Label>
          <Select name="assigned_admin_id" defaultValue={order.assigned_admin_id || "none"}>
            <SelectTrigger id="assigned_admin_id">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No admin assigned</SelectItem>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="special_instructions">Special Instructions</Label>
        <Textarea
          id="special_instructions"
          name="special_instructions"
          placeholder="Any special requirements or notes..."
          rows={4}
          defaultValue={order.special_instructions || ""}
        />
      </div>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Order
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
