"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function CreateClientForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const full_name = formData.get("full_name") as string
    const company_name = formData.get("company_name") as string
    const phone = formData.get("phone") as string

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("You must be logged in to create a client")

      // Create the user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            role: "client",
            company_name: company_name || null,
            phone: phone || null,
          },
        },
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error("Failed to create user account")
      }

      const { error: relationError } = await supabase.from("admin_clients").insert({
        admin_id: user.id,
        client_id: authData.user.id,
      })

      if (relationError) {
        console.error("[v0] Failed to create admin-client relationship:", relationError)
        // Don't throw - the client was created successfully, just log the error
      }

      // Success - redirect to clients page
      router.push("/admin/clients")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input id="full_name" name="full_name" placeholder="John Doe" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" placeholder="john@example.com" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 6 characters"
            minLength={6}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input id="company_name" name="company_name" placeholder="Acme Coffee Co." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567" />
        </div>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Client
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
