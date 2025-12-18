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

      // Update order
      const { error } = await supabase
        .from("orders")
        .update({
          package_received: true,
          package_received_at: new Date().toISOString(),
          order_stage: "package_received",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      // Create log
      await supabase.from("order_logs").insert({
        order_id: orderId,
        user_id: user?.id,
        action: "Package received",
        notes: "Coffee package has arrived and been logged",
        previous_status: "confirmed",
        new_status: "confirmed",
      })

      // Send notification
      await sendPackageReceivedNotification(orderId)

      toast({
        title: "Package confirmed",
        description: "The client has been notified that their package arrived.",
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
