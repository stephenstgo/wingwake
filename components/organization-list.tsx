import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { OrganizationMembers } from '@/components/organization-members'
import { getOrganizationMembers } from '@/lib/db/organizations'
import { canManageOrganization } from '@/lib/permissions'
import type { Organization } from '@/lib/types/database'
import { convexClient, api } from '@/lib/convex/server'
import { Id } from '@/convex/_generated/dataModel'

interface OrganizationListProps {
  organizations: Organization[]
  userId: string
}

export async function OrganizationList({ organizations, userId }: OrganizationListProps) {
  const orgsWithMembers = await Promise.all(
    organizations.map(async (org) => {
      const members = await getOrganizationMembers(org.id)
      const canManage = await canManageOrganization(org.id as Id<"organizations">, userId as Id<"profiles">)
      
      // Get profiles for members
      const membersWithProfiles = await Promise.all(
        members.map(async (member) => {
          const profile = await convexClient.query(api["queries/profiles"].getProfile, {
            id: member.user_id as Id<"profiles">,
          });
          return { ...member, profile: profile ? {
            id: profile._id,
            email: profile.email,
            full_name: profile.fullName,
            role: profile.role,
          } : undefined }
        })
      )
      
      return {
        ...org,
        members: membersWithProfiles,
        canManage,
      }
    })
  )

  return (
    <div className="space-y-6">
      {orgsWithMembers.map((org) => (
        <div key={org.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {org.type}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700">Members</h4>
            </div>
            <OrganizationMembers
              organizationId={org.id}
              members={org.members}
              canManage={org.canManage}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
