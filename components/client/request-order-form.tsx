"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function RequestOrderForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [admins, setAdmins] = useState<{ id: string; full_name: string; company_name: string | null }[]>([])
  const [selectedAdmin, setSelectedAdmin] = useState<string>("")
  const [hasAdminRelationship, setHasAdminRelationship] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAdminRelationship = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: relationships } = await supabase
        .from("admin_clients")
        .select("admin_id")
        .eq("client_id", user.id)
        .limit(1)

      setHasAdminRelationship((relationships?.length ?? 0) > 0)

      if (!relationships || relationships.length === 0) {
        const { data: adminData } = await supabase
          .from("profiles")
          .select("id, full_name, company_name")
          .eq("role", "admin")
          .order("full_name")

        setAdmins(adminData || [])
      }
    }

    checkAdminRelationship()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("You must be logged in to request an order")

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, company_name, phone")
        .eq("id", user.id)
        .single()

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

      const { error: insertError } = await supabase.from("orders").insert({
        order_number: orderNumber,
        client_id: user.id,
        client_name: profile?.full_name || "Unknown",
        client_email: profile?.email || user.email || "Unknown",
        client_company: profile?.company_name,
        client_phone: profile?.phone,
        coffee_type: formData.get("coffee_type") as string,
        quantity_kg: Number.parseFloat(formData.get("quantity_kg") as string),
        special_instructions: formData.get("special_instructions") as string,
        requested_completion_date: formData.get("requested_completion_date") as string,
        status: "pending",
        assigned_admin_id: selectedAdmin || null,
      })

      if (insertError) throw insertError

      if (selectedAdmin && !hasAdminRelationship) {
        const { error: relationError } = await supabase.from("admin_clients").insert({
          admin_id: selectedAdmin,
          client_id: user.id,
        })

        if (relationError) {
          console.error("[v0] Failed to create admin-client relationship:", relationError)
          // Don't throw - order was created successfully
        }
      }

      toast({
        title: "Order submitted successfully!",
        description: `Your order ${orderNumber} has been submitted and is pending review.`,
      })

      router.push("/client")
      router.refresh()
    } catch (err) {
      console.error("[v0] Order submission error:", err)
      toast({
        title: "Failed to submit order",
        description: err instanceof Error ? err.message : "An error occurred while submitting your order",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {!hasAdminRelationship && admins.length > 0 && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="admin_id">Select Freeze Dryer Provider *</Label>
            <Select value={selectedAdmin} onValueChange={setSelectedAdmin} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a provider..." />
              </SelectTrigger>
              <SelectContent>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.full_name}
                    {admin.company_name && ` - ${admin.company_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This will assign you to this provider for all future orders.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="coffee_type">Coffee Type *</Label>
          <Input id="coffee_type" name="coffee_type" placeholder="e.g., Arabica, Robusta" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity_kg">Quantity (kg) *</Label>
          <Input
            id="quantity_kg"
            name="quantity_kg"
            type="number"
            step="0.01"
            placeholder="50.00"
            required
            min="0.01"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="requested_completion_date">Requested Completion Date *</Label>
          <Input id="requested_completion_date" name="requested_completion_date" type="date" required />
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

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || (!hasAdminRelationship && !selectedAdmin)}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Order Request
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
