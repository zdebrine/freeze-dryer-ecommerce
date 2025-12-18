"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Loader2 } from "lucide-react"
import { sendOrderConfirmationNotification } from "@/lib/actions/order-notifications"

export function OrderConfirmation({ orderId }: { orderId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleConfirm = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: currentOrder } = await supabase
        .from("orders")
        .select("assigned_admin_id")
        .eq("id", orderId)
        .single()

      const { error } = await supabase
        .from("orders")
        .update({
          status: "confirmed",
          order_stage: "awaiting_shipment",
          assigned_admin_id: currentOrder?.assigned_admin_id || user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      // Create log
      await supabase.from("order_logs").insert({
        order_id: orderId,
        user_id: user?.id,
        action: "Order confirmed",
        notes: "Order has been accepted and client notified to ship coffee",
        previous_status: "pending",
        new_status: "confirmed",
      })

      // Send confirmation email
      await sendOrderConfirmationNotification(orderId)

      toast({
        title: "Order confirmed",
        description: "The client has been notified to ship their coffee.",
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Error confirming order:", error)
      toast({
        title: "Error",
        description: "Failed to confirm order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Update order to cancelled
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          order_stage: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      // Create log
      await supabase.from("order_logs").insert({
        order_id: orderId,
        user_id: user?.id,
        action: "Order rejected",
        notes: "Order was declined",
        previous_status: "pending",
        new_status: "cancelled",
      })

      toast({
        title: "Order rejected",
        description: "The order has been cancelled.",
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Error rejecting order:", error)
      toast({
        title: "Error",
        description: "Failed to reject order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-3">
      <Button onClick={handleConfirm} disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
        Confirm Order
      </Button>
      <Button onClick={handleReject} variant="destructive" disabled={isLoading}>
        <X className="mr-2 h-4 w-4" />
        Reject Order
      </Button>
    </div>
  )
}
