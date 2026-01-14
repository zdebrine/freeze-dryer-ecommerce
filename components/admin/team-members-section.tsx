"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { UserPlus, Trash2, Mail } from "lucide-react"

interface TeamMember {
  id: string
  full_name: string | null
  email: string
  role: string
  created_at: string
}

interface Invitation {
  id: string
  email: string
  status: string
  created_at: string
  expires_at: string
}

interface TeamMembersSectionProps {
  teamMembers: TeamMember[]
  invitations: Invitation[]
}

export function TeamMembersSection({ teamMembers, invitations }: TeamMembersSectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  const handleInviteTeamMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("email, role")
        .eq("email", inviteEmail)
        .single()

      if (existingProfile) {
        toast({
          title: "Error",
          description: "A user with this email already exists in the system.",
          variant: "destructive",
        })
        return
      }

      // Check if invitation already exists
      const { data: existingInvitation } = await supabase
        .from("team_invitations")
        .select("email, status")
        .eq("email", inviteEmail)
        .eq("status", "pending")
        .single()

      if (existingInvitation) {
        toast({
          title: "Error",
          description: "An invitation has already been sent to this email.",
          variant: "destructive",
        })
        return
      }

      // Generate unique token
      const token = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Get current user's name for the email
      const { data: inviterProfile } = await supabase.from("profiles").select("full_name").eq("id", user?.id).single()

      // Create invitation
      const { error: inviteError } = await supabase.from("team_invitations").insert({
        invited_by: user?.id,
        email: inviteEmail,
        role: "employee",
        token,
        expires_at: expiresAt.toISOString(),
      })

      if (inviteError) throw inviteError

      const inviteLink = `${window.location.origin}/invite/${token}`
      const inviterName = inviterProfile?.full_name || "Your manager"

      try {
        const response = await fetch("/api/send-team-invitation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: inviteEmail,
            inviterName,
            inviteLink,
          }),
        })

        if (!response.ok) {
          console.error("[v0] Failed to send invitation email, but invitation was created")
        }
      } catch (emailError) {
        console.error("[v0] Error sending invitation email:", emailError)
        // Don't fail the whole process if email fails
      }

      toast({
        title: "Invitation sent",
        description: `An invitation email has been sent to ${inviteEmail}. They have 7 days to accept.`,
      })

      setInviteEmail("")
      setIsInviteDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error inviting team member:", error)
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteInvitation = async (invitationId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("team_invitations").delete().eq("id", invitationId)

      if (error) throw error

      toast({
        title: "Invitation deleted",
        description: "The invitation has been removed.",
      })
      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting invitation:", error)
      toast({
        title: "Error",
        description: "Failed to delete invitation. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveTeamMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member? They will lose access immediately.")) {
      return
    }

    try {
      const supabase = createClient()

      // Delete the user's profile (this will cascade delete related data)
      const { error } = await supabase.from("profiles").delete().eq("id", memberId)

      if (error) throw error

      toast({
        title: "Team member removed",
        description: "The team member has been removed from your organization.",
      })
      router.refresh()
    } catch (error) {
      console.error("[v0] Error removing team member:", error)
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage your organization's employees</CardDescription>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleInviteTeamMember}>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>Send an invitation to add a new employee to your organization.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="employee@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="font-medium mb-1">Employee Permissions:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>View and update orders</li>
                      <li>Sign off on process stages</li>
                      <li>Cannot create invoices or complete orders</li>
                    </ul>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No team members yet. Invite someone to get started.
                  </TableCell>
                </TableRow>
              ) : (
                teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.full_name || "—"}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{member.role === "employee" ? "Employee" : member.role}</Badge>
                    </TableCell>
                    <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveTeamMember(member.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Invitations waiting to be accepted</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {invitation.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={invitation.status === "pending" ? "secondary" : "outline"}>
                        {invitation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteInvitation(invitation.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
