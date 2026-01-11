import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { OrganizationMembers } from '@/components/organization-members'
import { getOrganizationMembers } from '@/lib/db/organizations'
import { canManageOrganization } from '@/lib/permissions'
import type { Organization } from '@/lib/types/database'

interface OrganizationListProps {
  organizations: Organization[]
  userId: string
}

export async function OrganizationList({ organizations, userId }: OrganizationListProps) {
  const supabase = await createClient()
  
  const orgsWithMembers = await Promise.all(
    organizations.map(async (org) => {
      const members = await getOrganizationMembers(org.id)
      const canManage = await canManageOrganization(org.id)
      
      // Get profiles for members
      const membersWithProfiles = await Promise.all(
        members.map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', member.user_id)
            .single()
          return { ...member, profile: profile || undefined }
        })
      )

      return { org, members: membersWithProfiles, canManage }
    })
  )

  return (
    <div className="space-y-6">
      {orgsWithMembers.map(({ org, members, canManage }) => (
        <div key={org.id} className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{org.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{org.type}</p>
            </div>
            <Badge variant="secondary" className="capitalize">
              {org.type}
            </Badge>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-500" />
              <h4 className="font-medium text-sm">Members</h4>
            </div>
            <OrganizationMembers
              organizationId={org.id}
              initialMembers={members}
              currentUserId={userId}
              canManage={canManage}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
