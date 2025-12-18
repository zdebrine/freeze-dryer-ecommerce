"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function TrackingNumberForm({ orderId }: { orderId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [trackingNumber, setTrackingNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Update order with tracking number
      const { error } = await supabase
        .from("orders")
        .update({
          tracking_number: trackingNumber,
          tracking_confirmed_at: new Date().toISOString(),
          order_stage: "package_in_transit",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      // Create order log
      await supabase.from("order_logs").insert({
        order_id: orderId,
        action: "Tracking number added",
        notes: `Tracking: ${trackingNumber}`,
        previous_status: "awaiting_shipment",
        new_status: "package_in_transit",
      })

      try {
        await fetch("/api/notifications/tracking-submitted", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        })
      } catch (emailError) {
        console.error("[v0] Error sending tracking notification:", emailError)
        // Don't fail the whole operation if email fails
      }

      toast({
        title: "Tracking number added",
        description: "We'll monitor your shipment and notify you when it arrives.",
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Error adding tracking number:", error)
      toast({
        title: "Error",
        description: "Failed to add tracking number. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="tracking_number">Tracking Number *</Label>
        <Input
          id="tracking_number"
          required
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Enter your shipping tracking number"
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit Tracking Number"}
      </Button>
    </form>
  )
}
