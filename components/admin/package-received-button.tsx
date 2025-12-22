"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Package, Loader2 } from "lucide-react"
import { sendPackageReceivedNotification } from "@/lib/actions/order-notifications"

export function PackageReceivedButton({ orderId }: { orderId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handlePackageReceived = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase
        .from("orders")
        .update({
          package_received: true,
          package_received_at: new Date().toISOString(),
          unified_status: "pre_freeze_prep",
          status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      await supabase.from("order_logs").insert({
        order_id: orderId,
        user_id: user?.id,
        action: "Package received - moved to Pre-Freeze Prep",
        notes: "Coffee package has arrived and is ready for processing",
        previous_status: "awaiting_shipment",
        new_status: "pre_freeze_prep",
      })

      // Send notification
      await sendPackageReceivedNotification(orderId)

      toast({
        title: "Package received",
        description: "Order moved to Pre-Freeze Prep stage.",
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Error confirming package:", error)
      toast({
        title: "Error",
        description: "Failed to confirm package receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handlePackageReceived} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
      Confirm Package Received
    </Button>
  )
}
