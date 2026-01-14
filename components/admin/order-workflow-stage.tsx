"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Package, Scale, Box, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

type Machine = {
  id: string
  machine_name: string
  machine_code: string
  status: string
}

type OrderWorkflowStageProps = {
  orderId: string
  currentStatus: string
  order: any
  machines: Machine[]
}

export function OrderWorkflowStage({ orderId, currentStatus, order, machines }: OrderWorkflowStageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [concentrateWeight, setConcentrateWeight] = useState("")
  const [selectedMachine, setSelectedMachine] = useState("")
  const [powderWeight, setPowderWeight] = useState("")
  const [packagingType, setPackagingType] = useState<"bulk_100g" | "sachet_6pack" | "custom">("bulk_100g")
  const [bulkCount, setBulkCount] = useState("")
  const [bulkCost, setBulkCost] = useState("")
  const [sachetCount, setSachetCount] = useState("")
  const [sachetCost, setSachetCost] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [customCost, setCustomCost] = useState("")
  const [signoffNotes, setSignoffNotes] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const availableMachines = machines.filter((m) => m.status === "available")

  const handlePreFreezeComplete = async () => {
    // Convert grams to kg
    const weightInKg = Number.parseFloat(concentrateWeight) / 1000

    if (!concentrateWeight || weightInKg <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter the concentrate weight in grams",
        variant: "destructive",
      })
      return
    }

    if (!selectedMachine && availableMachines.length > 0) {
      toast({
        title: "Select a freeze dryer",
        description: "Please select which freeze dryer to use",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user?.id).single()

      // Determine next status based on machine availability
      const nextStatus = availableMachines.length === 0 ? "waiting_for_freeze_dryer" : "freeze_drying"

      // Update order with concentrate weight and status
      const updateData: any = {
        concentrate_input_weight_kg: weightInKg,
        unified_status: nextStatus,
        updated_at: new Date().toISOString(),
      }

      if (selectedMachine) {
        updateData.machine_id = selectedMachine
      }

      const { error: updateError } = await supabase.from("orders").update(updateData).eq("id", orderId)

      if (updateError) throw updateError

      // Update machine status if assigned
      if (selectedMachine) {
        await supabase.from("machines").update({ status: "in_use" }).eq("id", selectedMachine)
      }

      // Create sign-off record
      await supabase.from("order_signoffs").insert({
        order_id: orderId,
        stage: "pre_freeze_prep",
        signed_by_id: user?.id,
        signed_by_name: profile?.full_name || "Unknown",
        signed_by_role: profile?.role || "admin",
        notes: signoffNotes || `Concentrate weight: ${concentrateWeight}g`,
      })

      // Create log entry
      await supabase.from("order_logs").insert({
        order_id: orderId,
        user_id: user?.id,
        action: `Pre-freeze prep completed. ${concentrateWeight}g concentrate input recorded.`,
        previous_status: currentStatus,
        new_status: nextStatus,
      })

      toast({
        title: "Stage completed",
        description:
          nextStatus === "waiting_for_freeze_dryer"
            ? "Order is waiting for an available freeze dryer"
            : "Order moved to freeze drying stage",
      })

      router.refresh()
    } catch (err) {
      toast({
        title: "Failed to complete stage",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFreezeDryComplete = async () => {
    // Convert grams to kg
    const weightInKg = Number.parseFloat(powderWeight) / 1000

    if (!powderWeight || weightInKg <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter the powder weight in grams",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user?.id).single()

      // Calculate yield
      let yieldPercent = null
      if (order.concentrate_input_weight_kg) {
        yieldPercent = (weightInKg / order.concentrate_input_weight_kg) * 100
      }

      const { error: updateError } = await supabase
        .from("orders")
        .update({
          powder_output_weight_kg: weightInKg,
          concentrate_to_powder_yield_percent: yieldPercent,
          unified_status: "final_packaging",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateError) throw updateError

      // Release machine
      if (order.machine_id) {
        await supabase.from("machines").update({ status: "available" }).eq("id", order.machine_id)
      }

      // Create sign-off record
      await supabase.from("order_signoffs").insert({
        order_id: orderId,
        stage: "freeze_drying_complete",
        signed_by_id: user?.id,
        signed_by_name: profile?.full_name || "Unknown",
        signed_by_role: profile?.role || "admin",
        notes:
          signoffNotes ||
          `Powder output: ${powderWeight}g${yieldPercent ? `, Yield: ${yieldPercent.toFixed(1)}%` : ""}`,
      })

      // Create log entry
      await supabase.from("order_logs").insert({
        order_id: orderId,
        user_id: user?.id,
        action: `Freeze drying completed. ${powderWeight}g powder output recorded.`,
        previous_status: currentStatus,
        new_status: "final_packaging",
      })

      toast({
        title: "Freeze drying completed",
        description: "Order moved to final packaging stage",
      })

      router.refresh()
    } catch (err) {
      toast({
        title: "Failed to complete stage",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePackagingComplete = async () => {
    let totalCost = 0
    let totalWeight = 0

    if (packagingType === "bulk_100g") {
      if (!bulkCount || !bulkCost || Number.parseFloat(bulkCount) <= 0 || Number.parseFloat(bulkCost) <= 0) {
        toast({
          title: "Invalid packaging data",
          description: "Please enter the number of bags and cost per bag",
          variant: "destructive",
        })
        return
      }
      totalCost = Number.parseFloat(bulkCount) * Number.parseFloat(bulkCost)
      totalWeight = Number.parseFloat(bulkCount) * 0.1 // 100g = 0.1kg per bag
    } else if (packagingType === "sachet_6pack") {
      if (!sachetCount || !sachetCost || Number.parseFloat(sachetCount) <= 0 || Number.parseFloat(sachetCost) <= 0) {
        toast({
          title: "Invalid packaging data",
          description: "Please enter the number of boxes and cost per box",
          variant: "destructive",
        })
        return
      }
      totalCost = Number.parseFloat(sachetCount) * Number.parseFloat(sachetCost)
      totalWeight = Number.parseFloat(sachetCount) * 0.024 // 6 sachets * 4g = 24g = 0.024kg per box
    } else {
      if (!customDescription || !customCost || Number.parseFloat(customCost) <= 0) {
        toast({
          title: "Invalid packaging data",
          description: "Please enter the packaging description and total cost",
          variant: "destructive",
        })
        return
      }
      totalCost = Number.parseFloat(customCost)
      // For custom, use the powder output weight
      totalWeight = order.powder_output_weight_kg || 0
    }

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user?.id).single()

      const updateData: any = {
        packaging_type: packagingType,
        total_packaging_cost: totalCost,
        final_packaged_weight_kg: totalWeight,
        unified_status: "ready_for_payment",
        updated_at: new Date().toISOString(),
      }

      if (packagingType === "bulk_100g") {
        updateData.bulk_bags_count = Number.parseInt(bulkCount)
        updateData.bulk_bag_cost_per_unit = Number.parseFloat(bulkCost)
      } else if (packagingType === "sachet_6pack") {
        updateData.sachet_boxes_count = Number.parseInt(sachetCount)
        updateData.sachet_box_cost_per_unit = Number.parseFloat(sachetCost)
      } else {
        updateData.custom_packaging_description = customDescription
      }

      const { error: updateError } = await supabase.from("orders").update(updateData).eq("id", orderId)

      if (updateError) throw updateError

      // Create sign-off record
      await supabase.from("order_signoffs").insert({
        order_id: orderId,
        stage: "final_packaging",
        signed_by_id: user?.id,
        signed_by_name: profile?.full_name || "Unknown",
        signed_by_role: profile?.role || "admin",
        notes: signoffNotes || `Packaging: ${packagingType}, Total cost: $${totalCost.toFixed(2)}`,
      })

      // Create log entry
      await supabase.from("order_logs").insert({
        order_id: orderId,
        user_id: user?.id,
        action: `Final packaging completed. Total cost: $${totalCost.toFixed(2)}`,
        previous_status: currentStatus,
        new_status: "ready_for_payment",
      })

      toast({
        title: "Packaging completed",
        description: "Order is ready for payment invoice creation",
      })

      router.refresh()
    } catch (err) {
      toast({
        title: "Failed to complete stage",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Render stage-specific UI
  if (currentStatus === "pre_freeze_prep") {
    return (
      <Card className="border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Pre-Freeze Prep - Record Concentrate Weight
          </CardTitle>
          <CardDescription>
            Enter the weight of coffee concentrate being loaded into the freeze dryer (in grams)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="concentrate-weight">Concentrate Weight (grams) *</Label>
            <Input
              id="concentrate-weight"
              type="number"
              step="0.1"
              min="0"
              value={concentrateWeight}
              onChange={(e) => setConcentrateWeight(e.target.value)}
              placeholder="e.g., 45500"
              required
            />
            <p className="text-xs text-muted-foreground">Enter weight in grams (will be converted to kg)</p>
          </div>

          {availableMachines.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="machine">Select Freeze Dryer *</Label>
              <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                <SelectTrigger id="machine">
                  <SelectValue placeholder="Choose a freeze dryer" />
                </SelectTrigger>
                <SelectContent>
                  {availableMachines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.machine_name} ({machine.machine_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableMachines.length === 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>No freeze dryers currently available. Order will be marked as waiting for an available machine.</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="signoff-notes">Notes (Optional)</Label>
            <Textarea
              id="signoff-notes"
              value={signoffNotes}
              onChange={(e) => setSignoffNotes(e.target.value)}
              placeholder="Add any additional notes..."
            />
          </div>

          <Button onClick={handlePreFreezeComplete} disabled={isLoading} className="w-full" size="lg">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Sign Off & Move to Freeze Dryer
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (currentStatus === "waiting_for_freeze_dryer") {
    return (
      <Card className="border-amber-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Waiting for Available Freeze Dryer
          </CardTitle>
          <CardDescription>
            This order is ready to begin freeze drying but is waiting for an available machine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Concentrate weight recorded:{" "}
            {order.concentrate_input_weight_kg ? `${(order.concentrate_input_weight_kg * 1000).toFixed(0)}g` : "N/A"}
          </p>
          {availableMachines.length > 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="machine">Assign Freeze Dryer</Label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                  <SelectTrigger id="machine">
                    <SelectValue placeholder="Choose a freeze dryer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMachines.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {machine.machine_name} ({machine.machine_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={async () => {
                  if (!selectedMachine) {
                    toast({
                      title: "Select a machine",
                      description: "Please choose a freeze dryer",
                      variant: "destructive",
                    })
                    return
                  }
                  setIsLoading(true)
                  try {
                    await supabase
                      .from("orders")
                      .update({ machine_id: selectedMachine, unified_status: "freeze_drying" })
                      .eq("id", orderId)
                    await supabase.from("machines").update({ status: "in_use" }).eq("id", selectedMachine)
                    toast({ title: "Machine assigned", description: "Order moved to freeze drying stage" })
                    router.refresh()
                  } catch (err) {
                    toast({ title: "Error", description: "Failed to assign machine", variant: "destructive" })
                  } finally {
                    setIsLoading(false)
                  }
                }}
                disabled={isLoading || !selectedMachine}
                className="w-full"
                size="lg"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Machine & Start Freeze Drying
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  if (currentStatus === "freeze_drying") {
    return (
      <Card className="border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            In Progress: Freeze Drying
          </CardTitle>
          <CardDescription>Enter the total weight of freeze-dried powder produced (in grams)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm">
              <span className="font-medium">Concentrate Input:</span>{" "}
              {order.concentrate_input_weight_kg ? `${(order.concentrate_input_weight_kg * 1000).toFixed(0)}g` : "N/A"}
            </p>
            {order.machines && (
              <p className="text-sm mt-1">
                <span className="font-medium">Machine:</span> {order.machines.machine_name} (
                {order.machines.machine_code})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="powder-weight">Freeze-Dried Powder Weight (grams) *</Label>
            <Input
              id="powder-weight"
              type="number"
              step="0.1"
              min="0"
              value={powderWeight}
              onChange={(e) => setPowderWeight(e.target.value)}
              placeholder="e.g., 12350"
              required
            />
            <p className="text-xs text-muted-foreground">Enter weight in grams (will be converted to kg)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signoff-notes">Notes (Optional)</Label>
            <Textarea
              id="signoff-notes"
              value={signoffNotes}
              onChange={(e) => setSignoffNotes(e.target.value)}
              placeholder="Add any additional notes..."
            />
          </div>

          <Button onClick={handleFreezeDryComplete} disabled={isLoading} className="w-full" size="lg">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <CheckCircle2 className="mr-2 h-4 w-4" />
            End Freeze Dry Period & Move to Final Packaging
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (currentStatus === "final_packaging") {
    return (
      <Card className="border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Final Packaging
          </CardTitle>
          <CardDescription>Select packaging type and enter quantities with costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm">
              <span className="font-medium">Powder Output:</span>{" "}
              {order.powder_output_weight_kg ? `${(order.powder_output_weight_kg * 1000).toFixed(0)}g` : "N/A"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="packaging-type">Packaging Type *</Label>
            <Select value={packagingType} onValueChange={(v: any) => setPackagingType(v)}>
              <SelectTrigger id="packaging-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bulk_100g">Bulk 100g Bags</SelectItem>
                <SelectItem value="sachet_6pack">6-Pack of 4g Sachets</SelectItem>
                <SelectItem value="custom">Custom Packaging</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {packagingType === "bulk_100g" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bulk-count">Number of 100g Bags *</Label>
                <Input
                  id="bulk-count"
                  type="number"
                  min="1"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                  placeholder="e.g., 120"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulk-cost">Cost Per Bag ($) *</Label>
                <Input
                  id="bulk-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={bulkCost}
                  onChange={(e) => setBulkCost(e.target.value)}
                  placeholder="e.g., 15.00"
                  required
                />
              </div>
              {bulkCount && bulkCost && (
                <p className="text-sm font-medium">
                  Total Cost: ${(Number.parseFloat(bulkCount) * Number.parseFloat(bulkCost)).toFixed(2)}
                </p>
              )}
            </>
          )}

          {packagingType === "sachet_6pack" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sachet-count">Number of 6-Pack Boxes *</Label>
                <Input
                  id="sachet-count"
                  type="number"
                  min="1"
                  value={sachetCount}
                  onChange={(e) => setSachetCount(e.target.value)}
                  placeholder="e.g., 500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sachet-cost">Cost Per Box ($) *</Label>
                <Input
                  id="sachet-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={sachetCost}
                  onChange={(e) => setSachetCost(e.target.value)}
                  placeholder="e.g., 8.50"
                  required
                />
              </div>
              {sachetCount && sachetCost && (
                <p className="text-sm font-medium">
                  Total Cost: ${(Number.parseFloat(sachetCount) * Number.parseFloat(sachetCost)).toFixed(2)}
                </p>
              )}
            </>
          )}

          {packagingType === "custom" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="custom-desc">Packaging Description *</Label>
                <Textarea
                  id="custom-desc"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Describe the custom packaging..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-cost">Total Order Cost ($) *</Label>
                <Input
                  id="custom-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={customCost}
                  onChange={(e) => setCustomCost(e.target.value)}
                  placeholder="e.g., 2500.00"
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="signoff-notes">Notes (Optional)</Label>
            <Textarea
              id="signoff-notes"
              value={signoffNotes}
              onChange={(e) => setSignoffNotes(e.target.value)}
              placeholder="Add any additional notes..."
            />
          </div>

          <Button onClick={handlePackagingComplete} disabled={isLoading} className="w-full" size="lg">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Complete Packaging & Move to Payment
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}
