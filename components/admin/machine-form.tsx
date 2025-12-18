"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { Machine } from "@/lib/types/database"

export function MachineForm({ machine }: { machine?: Machine }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const machineData = {
        machine_name: formData.get("machine_name") as string,
        machine_code: formData.get("machine_code") as string,
        capacity_kg: Number.parseFloat(formData.get("capacity_kg") as string),
        status: (formData.get("status") as string) || "available",
        notes: formData.get("notes") as string,
      }

      if (machine) {
        // Update existing machine
        const { error: updateError } = await supabase.from("machines").update(machineData).eq("id", machine.id)

        if (updateError) throw updateError
      } else {
        // Create new machine
        const { error: insertError } = await supabase.from("machines").insert(machineData)

        if (insertError) throw insertError
      }

      router.push("/admin/machines")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save machine")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="machine_name">Machine Name *</Label>
          <Input
            id="machine_name"
            name="machine_name"
            placeholder="Freeze Dryer Alpha"
            defaultValue={machine?.machine_name}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="machine_code">Machine Code *</Label>
          <Input
            id="machine_code"
            name="machine_code"
            placeholder="FD-A001"
            defaultValue={machine?.machine_code}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity_kg">Capacity (kg) *</Label>
          <Input
            id="capacity_kg"
            name="capacity_kg"
            type="number"
            step="0.01"
            placeholder="50.00"
            defaultValue={machine?.capacity_kg}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select name="status" defaultValue={machine?.status || "available"}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in_use">In Use</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any additional information about this machine..."
          rows={4}
          defaultValue={machine?.notes || ""}
        />
      </div>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {machine ? "Update Machine" : "Add Machine"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
