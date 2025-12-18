"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function CreateOrderForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<{ id: string; full_name: string; company_name: string | null }[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("[v0] No user found")
        return
      }

      const { data: adminClientRelations, error } = await supabase
        .from("admin_clients")
        .select(
          `
          client_id,
          profiles!admin_clients_client_id_fkey(
            id,
            full_name,
            company_name
          )
        `,
        )
        .eq("admin_id", user.id)

      console.log("[v0] Admin client relations:", adminClientRelations)
      console.log("[v0] Query error:", error)

      // Extract client profiles from the relations
      const clientsData = adminClientRelations?.map((relation: any) => relation.profiles).filter(Boolean) || []

      console.log("[v0] Fetched clients:", clientsData)
      setClients(clientsData)
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const supabase = createClient()

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Admin user not found")

      // Get client profile data for snapshot
      const { data: clientProfile } = await supabase
        .from("profiles")
        .select("full_name, email, company_name, phone")
        .eq("id", selectedClientId)
        .single()

      const { error: insertError } = await supabase.from("orders").insert({
        order_number: orderNumber,
        client_id: selectedClientId,
        client_name: clientProfile?.full_name || "Unknown",
        client_email: clientProfile?.email || "Unknown",
        client_company: clientProfile?.company_name,
        client_phone: clientProfile?.phone,
        coffee_type: formData.get("coffee_type") as string,
        quantity_kg: Number.parseFloat(formData.get("quantity_kg") as string),
        special_instructions: formData.get("special_instructions") as string,
        requested_completion_date: formData.get("requested_completion_date") as string,
        status: "pending",
        assigned_admin_id: user.id,
      })

      if (insertError) throw insertError

      router.push("/admin/orders")
      router.refresh()
    } catch (err) {
      console.error("[v0] Order creation error:", err)
      setError(err instanceof Error ? err.message : "Failed to create order")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_id">Client *</Label>
          <Select name="client_id" value={selectedClientId} onValueChange={setSelectedClientId} required>
            <SelectTrigger id="client_id">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.length === 0 ? (
                <SelectItem value="none" disabled>
                  No clients available
                </SelectItem>
              ) : (
                clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name}
                    {client.company_name && ` (${client.company_name})`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coffee_type">Coffee Type *</Label>
          <Input id="coffee_type" name="coffee_type" placeholder="e.g., Arabica" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity_kg">Quantity (kg) *</Label>
          <Input id="quantity_kg" name="quantity_kg" type="number" step="0.01" placeholder="50.00" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requested_completion_date">Requested Completion Date</Label>
          <Input id="requested_completion_date" name="requested_completion_date" type="date" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="special_instructions">Special Instructions</Label>
        <Textarea
          id="special_instructions"
          name="special_instructions"
          placeholder="Any special requirements or notes..."
          rows={4}
        />
      </div>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || !selectedClientId}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Order
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
