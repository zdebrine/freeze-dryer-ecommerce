"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, Loader2, PenLine } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type Stage =
  | "pre_freeze_prep"
  | "freeze_drying_start"
  | "freeze_drying_complete"
  | "final_packaging"
  | "ready_for_payment"

type Signoff = {
  id: string
  stage: Stage
  signed_by_name: string
  signed_by_role: string
  signed_at: string
  notes: string | null
}

const STAGE_LABELS: Record<Stage, string> = {
  pre_freeze_prep: "Pre-Freeze Prep",
  freeze_drying_start: "Freeze Drying Start",
  freeze_drying_complete: "Freeze Drying Complete",
  final_packaging: "Final Packaging",
  ready_for_payment: "Ready for Payment",
}

const STAGE_DESCRIPTIONS: Record<Stage, string> = {
  pre_freeze_prep: "Confirm beans have been prepared and are ready for freeze drying",
  freeze_drying_start: "Confirm coffee concentrate has been loaded into freeze dryer",
  freeze_drying_complete: "Confirm freeze drying process is complete and powder has been collected",
  final_packaging: "Confirm final packaging is complete and ready for shipment",
  ready_for_payment: "Final approval before requesting payment from client",
}

export function StageSignoff({
  orderId,
  currentStage,
  existingSignoffs,
}: {
  orderId: string
  currentStage: string
  existingSignoffs: Signoff[]
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState("")
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const router = useRouter()

  // Determine which stage can be signed off based on current order status
  const getAvailableStage = (): Stage | null => {
    const signedStages = existingSignoffs.map((s) => s.stage)

    if (currentStage === "pre_freeze_prep" && !signedStages.includes("pre_freeze_prep")) {
      return "pre_freeze_prep"
    }
    if (currentStage === "freeze_drying" && !signedStages.includes("freeze_drying_start")) {
      return "freeze_drying_start"
    }
    if (
      currentStage === "freeze_drying" &&
      signedStages.includes("freeze_drying_start") &&
      !signedStages.includes("freeze_drying_complete")
    ) {
      return "freeze_drying_complete"
    }
    if (currentStage === "final_packaging" && !signedStages.includes("final_packaging")) {
      return "final_packaging"
    }
    if (currentStage === "ready_for_payment" && !signedStages.includes("ready_for_payment")) {
      return "ready_for_payment"
    }

    return null
  }

  const availableStage = getAvailableStage()

  const handleSignoff = async (stage: Stage) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single()

      if (!profile) throw new Error("Profile not found")

      // Insert signoff record
      const { error: signoffError } = await supabase.from("order_signoffs").insert({
        order_id: orderId,
        stage,
        signed_by_id: user.id,
        signed_by_name: profile.full_name,
        signed_by_role: profile.role,
        notes: notes || null,
      })

      if (signoffError) throw signoffError

      // Log the signoff action
      await supabase.from("order_logs").insert({
        order_id: orderId,
        user_id: user.id,
        action: `Signed off on ${STAGE_LABELS[stage]}`,
        notes: notes || null,
      })

      toast({
        title: "Stage signed off",
        description: `You have successfully signed off on ${STAGE_LABELS[stage]}`,
      })

      setNotes("")
      setSelectedStage(null)
      router.refresh()
    } catch (err) {
      toast({
        title: "Signoff failed",
        description: err instanceof Error ? err.message : "Failed to sign off on this stage",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Process Sign-Offs</h3>

      {/* Existing sign-offs */}
      <div className="space-y-2">
        {existingSignoffs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sign-offs yet</p>
        ) : (
          existingSignoffs.map((signoff) => (
            <Card key={signoff.id} className="bg-green-50 dark:bg-green-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base">{STAGE_LABELS[signoff.stage]}</CardTitle>
                </div>
                <CardDescription>
                  Signed by {signoff.signed_by_name} ({signoff.signed_by_role}) on{" "}
                  {new Date(signoff.signed_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
              {signoff.notes && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{signoff.notes}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Available sign-off */}
      {availableStage && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{STAGE_LABELS[availableStage]}</CardTitle>
            </div>
            <CardDescription>{STAGE_DESCRIPTIONS[availableStage]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signoff-notes">Notes (Optional)</Label>
              <Textarea
                id="signoff-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes about this stage..."
                rows={3}
              />
            </div>

            <Button onClick={() => handleSignoff(availableStage)} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Off on {STAGE_LABELS[availableStage]}
            </Button>
          </CardContent>
        </Card>
      )}

      {!availableStage && existingSignoffs.length > 0 && (
        <p className="text-sm text-muted-foreground">All available stages for current status have been signed off</p>
      )}
    </div>
  )
}
