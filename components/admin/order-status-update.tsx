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

const STATUS_OPTIONS = [
  { value: "pending_confirmation", label: "Pending Confirmation" },
  { value: "awaiting_shipment", label: "Confirmed: Awaiting Shipment" },
  { value: "pre_freeze_prep", label: "In Progress: Pre-Freeze Prep" },
  { value: "freeze_drying", label: "In Progress: Freeze Drying", requiresMachine: true },
  { value: "final_packaging", label: "Final Packaging" },
  { value: "ready_for_payment", label: "Ready For Payment" },
  { value: "completed", label: "Completed" },
]

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  currentMachineId,
  currentUnifiedStatus,
}: {
  orderId: string
  currentStatus: string
  currentMachineId: string | null
  currentUnifiedStatus?: string | null
}) {
  const [unifiedStatus, setUnifiedStatus] = useState(currentUnifiedStatus || currentStatus)
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
    if (unifiedStatus === "freeze_drying" && !machineId) {
      toast({
        title: "Machine required",
        description: "You must assign a freeze dryer machine for the Freeze Drying stage.",
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
        .select("machine_id, unified_status, status")
        .eq("id", orderId)
        .single()

      const previousMachineId = orderData?.machine_id
      const previousUnifiedStatus = orderData?.unified_status || orderData?.status

      let legacyStatus = "pending"
      if (["awaiting_shipment"].includes(unifiedStatus)) {
        legacyStatus = "confirmed"
      } else if (["pre_freeze_prep", "freeze_drying", "final_packaging"].includes(unifiedStatus)) {
        legacyStatus = "in_progress"
      } else if (["ready_for_payment", "completed"].includes(unifiedStatus)) {
        legacyStatus = "completed"
      }

      const unifiedToLegacyStageMap: Record<string, string> = {
        pending_confirmation: "pending_confirmation",
        awaiting_shipment: "awaiting_shipment",
        pre_freeze_prep: "pre_freeze",
        freeze_drying: "freezing",
        final_packaging: "packaging",
        ready_for_payment: "payment_pending",
        completed: "completed",
      }
      const legacyOrderStage = unifiedToLegacyStageMap[unifiedStatus] || unifiedStatus

      // Update order with unified status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          unified_status: unifiedStatus,
          status: legacyStatus,
          order_stage: legacyOrderStage, // Use mapped legacy value for constraint compliance
          machine_id: machineId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateError) throw updateError

      if (unifiedStatus === "freeze_drying" && machineId) {
        await supabase.from("machines").update({ status: "in_use" }).eq("id", machineId)
      }

      // Release machine when moving past freeze_drying or to completed
      if (previousUnifiedStatus === "freeze_drying" && unifiedStatus !== "freeze_drying" && previousMachineId) {
        await supabase.from("machines").update({ status: "available" }).eq("id", previousMachineId)
      }

      // Create log entry
      await supabase.from("order_logs").insert({
        order_id: orderId,
        user_id: user?.id,
        action: `Status updated to ${STATUS_OPTIONS.find((opt) => opt.value === unifiedStatus)?.label}`,
        previous_status: previousUnifiedStatus,
        new_status: unifiedStatus,
        notes: notes || null,
      })

      if (
        unifiedStatus !== previousUnifiedStatus &&
        ["pre_freeze_prep", "freeze_drying", "final_packaging"].includes(unifiedStatus)
      ) {
        // Map unified status to legacy stage names for email templates
        const stageMap: Record<string, string> = {
          pre_freeze_prep: "pre_freeze",
          freeze_drying: "freezing",
          final_packaging: "packaging",
        }
        await sendProcessingStageNotification(orderId, stageMap[unifiedStatus] || unifiedStatus)
      }

      toast({
        title: "Order updated",
        description: `Order status changed to ${STATUS_OPTIONS.find((opt) => opt.value === unifiedStatus)?.label}`,
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

  const currentOption = STATUS_OPTIONS.find((opt) => opt.value === unifiedStatus)
  const showMachineSelector = currentOption?.requiresMachine
  const showMachineWarning = showMachineSelector && !machineId

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="unified-status">Order Status</Label>
        <Select value={unifiedStatus} onValueChange={setUnifiedStatus}>
          <SelectTrigger id="unified-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showMachineSelector && (
        <>
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
              <p>You must assign a freeze dryer machine for the Freeze Drying stage.</p>
            </div>
          )}
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes..." />
      </div>

      <Button
        onClick={handleUpdate}
        disabled={isLoading || (unifiedStatus === currentUnifiedStatus && machineId === currentMachineId)}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update Order
      </Button>
    </div>
  )
}
