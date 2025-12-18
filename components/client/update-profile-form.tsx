"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Profile {
  id: string
  full_name: string | null
  email: string
  company_name: string | null
  phone: string | null
  shipping_address_line1: string | null
  shipping_address_line2: string | null
  shipping_city: string | null
  shipping_state: string | null
  shipping_postal_code: string | null
  shipping_country: string | null
}

export function UpdateProfileForm({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    company_name: profile?.company_name || "",
    shipping_address_line1: profile?.shipping_address_line1 || "",
    shipping_address_line2: profile?.shipping_address_line2 || "",
    shipping_city: profile?.shipping_city || "",
    shipping_state: profile?.shipping_state || "",
    shipping_postal_code: profile?.shipping_postal_code || "",
    shipping_country: profile?.shipping_country || "United States",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Shipping address fields require running migration script 012
      const updateData = {
        full_name: formData.full_name,
        phone: formData.phone,
        company_name: formData.company_name,
      }

      const { error } = await supabase.from("profiles").update(updateData).eq("id", profile?.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your information has been saved successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email || ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company_name">Company Name (Optional)</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
          <CardDescription>Where we'll ship your processed coffee</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="shipping_address_line1">Address Line 1 *</Label>
            <Input
              id="shipping_address_line1"
              required
              value={formData.shipping_address_line1}
              onChange={(e) => setFormData({ ...formData, shipping_address_line1: e.target.value })}
              placeholder="Street address"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shipping_address_line2">Address Line 2</Label>
            <Input
              id="shipping_address_line2"
              value={formData.shipping_address_line2}
              onChange={(e) => setFormData({ ...formData, shipping_address_line2: e.target.value })}
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="shipping_city">City *</Label>
              <Input
                id="shipping_city"
                required
                value={formData.shipping_city}
                onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shipping_state">State *</Label>
              <Input
                id="shipping_state"
                required
                value={formData.shipping_state}
                onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="shipping_postal_code">Postal Code *</Label>
              <Input
                id="shipping_postal_code"
                required
                value={formData.shipping_postal_code}
                onChange={(e) => setFormData({ ...formData, shipping_postal_code: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shipping_country">Country *</Label>
              <Input
                id="shipping_country"
                required
                value={formData.shipping_country}
                onChange={(e) => setFormData({ ...formData, shipping_country: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
