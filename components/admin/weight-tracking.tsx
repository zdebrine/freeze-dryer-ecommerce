"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Scale, TrendingDown } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type WeightData = {
  beans_input_weight_kg: number | null
  concentrate_output_weight_kg: number | null
  concentrate_input_weight_kg: number | null
  powder_output_weight_kg: number | null
  beans_to_concentrate_yield_percent: number | null
  concentrate_to_powder_yield_percent: number | null
}

export function WeightTracking({
  orderId,
  currentStage,
  weightData,
}: { orderId: string; currentStage: string; weightData: WeightData }) {
  const [isLoading, setIsLoading] = useState(false)
  const [concentrateInput, setConcentrateInput] = useState(weightData.concentrate_input_weight_kg?.toString() || "")
  const [powderOutput, setPowderOutput] = useState(weightData.powder_output_weight_kg?.toString() || "")
  const router = useRouter()

  const handleConcentrateInputSubmit = async () => {
    if (!concentrateInput || Number.parseFloat(concentrateInput) <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid concentrate weight",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("orders")
        .update({
          concentrate_input_weight_kg: Number.parseFloat(concentrateInput),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      const {
        data: { user },
      } = await supabase.auth.getUser()

      await supabase.from("order_logs").insert({
        order_id: orderId,
        user_id: user?.id,
        action: `Recorded concentrate input weight: ${concentrateInput}kg`,
      })

      toast({
        title: "Weight recorded",
        description: `Concentrate input weight of ${concentrateInput}kg has been recorded`,
      })

      router.refresh()
    } catch (err) {
      toast({
        title: "Failed to record weight",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePowderOutputSubmit = async () => {
    if (!powderOutput || Number.parseFloat(powderOutput) <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid powder weight",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("orders")
        .update({
          powder_output_weight_kg: Number.parseFloat(powderOutput),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      const {
        data: { user },
      } = await supabase.auth.getUser()

      await supabase.from("order_logs").insert({
        order_id: orderId,
        user_id: user?.id,
        action: `Recorded powder output weight: ${powderOutput}kg`,
      })

      toast({
        title: "Weight recorded",
        description: `Powder output weight of ${powderOutput}kg has been recorded`,
      })

      router.refresh()
    } catch (err) {
      toast({
        title: "Failed to record weight",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const showConcentrateInput = currentStage === "freeze_drying" && weightData.concentrate_input_weight_kg === null
  const showPowderOutput =
    currentStage === "freeze_drying" &&
    weightData.concentrate_input_weight_kg !== null &&
    weightData.powder_output_weight_kg === null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Weight Tracking</h3>

      {/* Display existing weight data */}
      <div className="grid gap-4 sm:grid-cols-2">
        {weightData.beans_input_weight_kg && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Beans Input</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{weightData.beans_input_weight_kg} kg</p>
            </CardContent>
          </Card>
        )}

        {weightData.concentrate_output_weight_kg && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Concentrate Output</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{weightData.concentrate_output_weight_kg} kg</p>
              {weightData.beans_to_concentrate_yield_percent && (
                <p className="text-sm text-muted-foreground mt-1">
                  {weightData.beans_to_concentrate_yield_percent.toFixed(1)}% yield
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {weightData.concentrate_input_weight_kg && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Concentrate Input (Freeze Dryer)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{weightData.concentrate_input_weight_kg} kg</p>
            </CardContent>
          </Card>
        )}

        {weightData.powder_output_weight_kg && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Instant Coffee Powder Output</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{weightData.powder_output_weight_kg} kg</p>
              {weightData.concentrate_to_powder_yield_percent && (
                <p className="text-sm text-muted-foreground mt-1">
                  {weightData.concentrate_to_powder_yield_percent.toFixed(1)}% yield
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Input forms for required weights at specific stages */}
      {showConcentrateInput && (
        <Card className="border-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Record Concentrate Input Weight
            </CardTitle>
            <CardDescription>
              Enter the weight of coffee concentrate being loaded into the freeze dryer (in kilograms)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="concentrate-input">Concentrate Weight (kg) *</Label>
              <Input
                id="concentrate-input"
                type="number"
                step="0.001"
                min="0.001"
                value={concentrateInput}
                onChange={(e) => setConcentrateInput(e.target.value)}
                placeholder="e.g., 45.500"
                required
              />
            </div>
            <Button onClick={handleConcentrateInputSubmit} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Concentrate Input
            </Button>
          </CardContent>
        </Card>
      )}

      {showPowderOutput && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Record Powder Output Weight
            </CardTitle>
            <CardDescription>
              Enter the weight of freeze dried instant coffee powder produced (in kilograms)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="powder-output">Powder Weight (kg) *</Label>
              <Input
                id="powder-output"
                type="number"
                step="0.001"
                min="0.001"
                value={powderOutput}
                onChange={(e) => setPowderOutput(e.target.value)}
                placeholder="e.g., 12.350"
                required
              />
            </div>
            <Button onClick={handlePowderOutputSubmit} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Powder Output
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
