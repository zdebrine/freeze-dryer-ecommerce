"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { sendProcessingStageNotification } from "@/lib/actions/order-notifications"

type Machine = { id: string; machine_name: string; machine_code: string; status: string }

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  currentMachineId,
  currentStage,
}: {
  orderId: string
  currentStatus: string
  currentMachineId: string | null
  currentStage?: string | null
}) {
  const [status, setStatus] = useState(currentStatus)
  const [stage, setStage] = useState(currentStage || "")
  const [machineId, setMachineId] = useState(currentMachineId || "")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [machines, setMachines] = useState<Machine[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchMachines = async () => {
      const { data } = await supabase.from("machines").select("id, machine_name, machine_code, status")
      setMachines(data || [])
    }
    fetchMachines()
  }, [])

  const handleUpdate = async () => {
    if (status === "in_progress" && !machineId) {
      toast({
        title: "Machine required",
        description: "You must assign a freeze dryer machine before moving the order to In Progress.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: orderData } = await supabase
        .from("orders")
        .select("machine_id, order_stage")
        .eq("id", orderId)
        .single()

      const previousMachineId = orderData?.machine_id
      const previousStage = orderData?.order_stage

      // Update order status, stage, and machine assignment
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status,
          order_stage: stage || null,
          machine_id: machineId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateError) throw updateError

      // Handle machine status updates
      if (status === "in_progress" && machineId) {
        await supabase.from("machines").update({ status: "in_use" }).eq("id", machineId)
      }

      if (status === "completed" && previousMachineId) {
        await supabase.from("machines").update({ status: "available" }).eq("id", previousMachineId)
      }

      // Create log entry
      await supabase.from("order_logs").insert({
        order_id: orderId,
        user_id: user?.id,
        action: stage ? `Status and stage updated to ${stage.replace(/_/g, " ")}` : "Status updated",
        previous_status: currentStatus,
        new_status: status,
        notes: notes || null,
      })

      // Send email notification if stage changed to a processing stage
      if (stage && stage !== previousStage && ["pre_freeze", "freezing", "post_freeze", "packaging"].includes(stage)) {
        await sendProcessingStageNotification(orderId, stage)
      }

      toast({
        title: "Order updated",
        description: `Order status changed to ${status.replace("_", " ")}`,
      })

      router.refresh()
      setNotes("")
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const showMachineWarning = status === "in_progress" && !machineId

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Order Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stage">Processing Stage</Label>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger id="stage">
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending_confirmation">Pending Confirmation</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="awaiting_shipment">Awaiting Shipment</SelectItem>
              <SelectItem value="package_in_transit">Package In Transit</SelectItem>
              <SelectItem value="package_received">Package Received</SelectItem>
              <SelectItem value="pre_freeze">Pre-Freeze Prep</SelectItem>
              <SelectItem value="freezing">Freeze-Drying</SelectItem>
              <SelectItem value="post_freeze">Post-Freeze Processing</SelectItem>
              <SelectItem value="packaging">Final Packaging</SelectItem>
              <SelectItem value="completed">Ready for Payment</SelectItem>
              <SelectItem value="payment_pending">Payment Pending</SelectItem>
              <SelectItem value="payment_completed">Payment Completed</SelectItem>
              <SelectItem value="shipped_to_customer">Shipped to Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="machine">Assigned Machine</Label>
        <Select value={machineId} onValueChange={setMachineId}>
          <SelectTrigger id="machine">
            <SelectValue placeholder="Select a machine" />
          </SelectTrigger>
          <SelectContent>
            {machines
              .filter((m) => m.status === "available" || m.id === currentMachineId)
              .map((machine) => (
                <SelectItem key={machine.id} value={machine.id}>
                  {machine.machine_name} ({machine.machine_code}) - {machine.status}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {showMachineWarning && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>You must assign a freeze dryer machine to move this order to In Progress.</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes..." />
      </div>

      <Button
        onClick={handleUpdate}
        disabled={isLoading || (status === currentStatus && machineId === currentMachineId && stage === currentStage)}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update Order
      </Button>
    </div>
  )
}
