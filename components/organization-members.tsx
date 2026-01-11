'use client'

import { useState } from 'react'
import { UserPlus, Mail, UserMinus, Crown, Shield, User } from 'lucide-react'
import { inviteUserToOrganizationAction, removeUserFromOrganizationAction } from '@/lib/actions/organizations'
import { useToast } from '@/components/toast'
import type { OrganizationMember } from '@/lib/types/database'
import type { Profile } from '@/lib/types/database'

interface OrganizationMembersProps {
  organizationId: string
  initialMembers: (OrganizationMember & { profile?: Profile })[]
  currentUserId: string
  canManage: boolean
}

export function OrganizationMembers({
  organizationId,
  initialMembers,
  currentUserId,
  canManage,
}: OrganizationMembersProps) {
  const [members, setMembers] = useState(initialMembers)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'manager' | 'owner'>('member')
  const [isInviting, setIsInviting] = useState(false)
  const { success, error: showError } = useToast()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsInviting(true)

    try {
      await inviteUserToOrganizationAction(organizationId, inviteEmail, inviteRole)
      success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      setInviteRole('member')
      setShowInviteForm(false)
      // Refresh members list
      window.location.reload()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to invite user')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from this organization?`)) {
      return
    }

    try {
      await removeUserFromOrganizationAction(organizationId, userId)
      setMembers(members.filter(m => m.user_id !== userId))
      success('Member removed successfully')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />
      case 'manager':
        return <Shield className="w-4 h-4 text-blue-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div>
          {!showInviteForm ? (
            <button
              onClick={() => setShowInviteForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite User
            </button>
          ) : (
            <form onSubmit={handleInvite} className="border rounded-lg p-4 space-y-4 bg-card">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  disabled={isInviting}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="user@example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  User must already have an account. Email invitations coming in Phase 2.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Role <span className="text-destructive">*</span>
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  required
                  disabled={isInviting}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="member">Member - Basic access</option>
                  <option value="manager">Manager - Can manage members and settings</option>
                  <option value="owner">Owner - Full control</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isInviting || !inviteEmail}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {isInviting ? 'Inviting...' : 'Send Invitation'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteForm(false)
                    setInviteEmail('')
                  }}
                  disabled={isInviting}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="space-y-2">
        {members.map((member) => {
          const profile = member.profile
          const isCurrentUser = member.user_id === currentUserId

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getRoleIcon(member.role)}
                <div>
                  <p className="font-medium">
                    {profile?.full_name || profile?.email || 'Unknown User'}
                    {isCurrentUser && (
                      <span className="text-xs text-muted-foreground ml-2">(You)</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getRoleLabel(member.role)} • Joined {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {canManage && !isCurrentUser && (
                <button
                  onClick={() => handleRemove(member.user_id, profile?.full_name || profile?.email || 'this user')}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Remove member"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
