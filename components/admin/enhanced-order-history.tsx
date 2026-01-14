"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Scale, TrendingDown, User } from "lucide-react"
import { Separator } from "@/components/ui/separator"

type OrderLog = {
  id: string
  action: string
  previous_status: string | null
  new_status: string | null
  notes: string | null
  created_at: string
  profiles: { full_name: string } | null
}

type Signoff = {
  id: string
  stage: string
  signed_by_name: string
  signed_by_role: string
  signed_at: string
  notes: string | null
}

type WeightData = {
  beans_input_weight_kg: number | null
  concentrate_output_weight_kg: number | null
  concentrate_input_weight_kg: number | null
  powder_output_weight_kg: number | null
  beans_to_concentrate_yield_percent: number | null
  concentrate_to_powder_yield_percent: number | null
}

const STAGE_LABELS: Record<string, string> = {
  pre_freeze_prep: "Pre-Freeze Prep",
  freeze_drying_start: "Freeze Drying Start",
  freeze_drying_complete: "Freeze Drying Complete",
  final_packaging: "Final Packaging",
  ready_for_payment: "Ready for Payment",
}

export function EnhancedOrderHistory({
  logs,
  signoffs,
  weightData,
}: {
  logs: OrderLog[]
  signoffs: Signoff[]
  weightData: WeightData
}) {
  // Combine logs and signoffs into a unified timeline
  const timeline = [
    ...logs.map((log) => ({
      type: "log" as const,
      timestamp: new Date(log.created_at).getTime(),
      data: log,
    })),
    ...signoffs.map((signoff) => ({
      type: "signoff" as const,
      timestamp: new Date(signoff.signed_at).getTime(),
      data: signoff,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp) // Most recent first

  return (
    <div className="space-y-6">
      {/* Production Summary with Yields */}
      {(weightData.beans_input_weight_kg || weightData.concentrate_input_weight_kg) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Production Summary
            </CardTitle>
            <CardDescription>Complete weight tracking and yield analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Beans to Concentrate */}
            {weightData.beans_input_weight_kg && weightData.concentrate_output_weight_kg && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Beans → Concentrate</h4>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-muted p-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Input</p>
                    <p className="text-lg font-bold">{weightData.beans_input_weight_kg} kg</p>
                  </div>
                  <TrendingDown className="h-5 w-5 text-muted-foreground hidden sm:block" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Output</p>
                    <p className="text-lg font-bold">{weightData.concentrate_output_weight_kg} kg</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Yield</p>
                    <Badge variant="outline" className="text-lg font-bold">
                      {weightData.beans_to_concentrate_yield_percent?.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Concentrate to Powder */}
            {weightData.concentrate_input_weight_kg && weightData.powder_output_weight_kg && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Concentrate → Instant Coffee Powder</h4>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-muted p-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Input</p>
                    <p className="text-lg font-bold">{weightData.concentrate_input_weight_kg} kg</p>
                  </div>
                  <TrendingDown className="h-5 w-5 text-muted-foreground hidden sm:block" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Output</p>
                    <p className="text-lg font-bold">{weightData.powder_output_weight_kg} kg</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Yield</p>
                    <Badge variant="outline" className="text-lg font-bold">
                      {weightData.concentrate_to_powder_yield_percent?.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Overall Yield if we have all data */}
            {weightData.beans_input_weight_kg && weightData.powder_output_weight_kg && (
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-semibold">Overall Process Efficiency</h4>
                <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total: Beans → Instant Coffee</p>
                    <p className="text-base">
                      {weightData.beans_input_weight_kg} kg → {weightData.powder_output_weight_kg} kg
                    </p>
                  </div>
                  <Badge className="text-lg font-bold">
                    {((weightData.powder_output_weight_kg / weightData.beans_input_weight_kg) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Process Sign-Offs Summary */}
      {signoffs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Process Sign-Offs
            </CardTitle>
            <CardDescription>Verification at each production stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {signoffs.map((signoff, index) => (
                <div key={signoff.id}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{STAGE_LABELS[signoff.stage] || signoff.stage}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>
                          {signoff.signed_by_name} ({signoff.signed_by_role})
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(signoff.signed_at).toLocaleString()}</p>
                  </div>
                  {signoff.notes && <p className="mt-2 text-sm text-muted-foreground italic">{signoff.notes}</p>}
                  {index < signoffs.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unified Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Order Timeline</CardTitle>
          <CardDescription>All activity, status changes, and sign-offs</CardDescription>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet</p>
          ) : (
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div key={`${item.type}-${index}`}>
                  <div className="flex gap-4 border-l-2 border-muted pl-4">
                    <div className="flex-1 space-y-1">
                      {item.type === "signoff" ? (
                        <>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <p className="font-medium">
                              Signed off: {STAGE_LABELS[item.data.stage] || item.data.stage}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.data.signed_by_name} ({item.data.signed_by_role})
                          </p>
                          {item.data.notes && <p className="text-sm text-muted-foreground italic">{item.data.notes}</p>}
                        </>
                      ) : (
                        <>
                          <p className="font-medium">{item.data.action}</p>
                          {item.data.new_status && (
                            <span className="text-sm text-muted-foreground">
                              {item.data.previous_status} → {item.data.new_status}
                            </span>
                          )}
                          {item.data.notes && <p className="text-sm text-muted-foreground italic">{item.data.notes}</p>}
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.data.created_at).toLocaleString()} •{" "}
                            {item.data.profiles?.full_name || "System"}
                          </p>
                        </>
                      )}
                      <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  {index < timeline.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
