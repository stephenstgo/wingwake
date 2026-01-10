'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserOrganizations, createOrganization, addMemberToOrganization } from '@/lib/db/organizations'
import type { OrganizationType } from '@/lib/types/database'

/**
 * Finds an existing organization by name for the current user, or creates a new one if it doesn't exist.
 * If a new organization is created, the user is automatically added as an owner.
 */
export async function findOrCreateOrganization(
  organizationName: string,
  type: OrganizationType = 'individual'
): Promise<string | null> {
  if (!organizationName || organizationName.trim() === '') {
    return null
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Get user's existing organizations
  const userOrgs = await getUserOrganizations(user.id)
  
  // Check if an organization with this name already exists for the user
  const existingOrg = userOrgs.find(org => 
    org.name.toLowerCase().trim() === organizationName.toLowerCase().trim()
  )

  if (existingOrg) {
    return existingOrg.id
  }

  // Organization doesn't exist, create it
  const newOrg = await createOrganization({
    name: organizationName.trim(),
    type,
  })

  if (!newOrg) {
    throw new Error('Failed to create organization')
  }

  // Add the user as an owner of the newly created organization
  await addMemberToOrganization(newOrg.id, user.id, 'owner')

  return newOrg.id
}
