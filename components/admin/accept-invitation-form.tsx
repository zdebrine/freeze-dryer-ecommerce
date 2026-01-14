"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface AcceptInvitationFormProps {
  invitation: {
    id: string
    email: string
    token: string
  }
}

export function AcceptInvitationForm({ invitation }: AcceptInvitationFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: "employee",
          },
        },
      })

      if (signUpError) throw signUpError

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from("team_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id)

      if (updateError) throw updateError

      // Create default employee permissions
      if (authData.user) {
        const { error: permissionsError } = await supabase.from("employee_permissions").insert({
          employee_id: authData.user.id,
          can_view_orders: true,
          can_update_orders: true,
          can_sign_off: true,
          can_create_invoices: false,
          can_complete_orders: false,
        })

        if (permissionsError) console.error("[v0] Error creating permissions:", permissionsError)
      }

      toast({
        title: "Account created",
        description: "Your account has been created successfully. You can now log in.",
      })

      // Redirect to login
      router.push("/login")
    } catch (error) {
      console.error("[v0] Error accepting invitation:", error)
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>You'll be joining as: {invitation.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={invitation.email} disabled className="bg-muted" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 8 characters"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter your password"
            />
          </div>

          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium mb-1">Your Permissions:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>View and update orders</li>
              <li>Sign off on process stages</li>
              <li>Record weight measurements</li>
            </ul>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Accept Invitation & Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
