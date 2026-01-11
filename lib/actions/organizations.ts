'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserOrganizations, createOrganization, addMemberToOrganization, getOrganizationMembers, removeMemberFromOrganization } from '@/lib/db/organizations'
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

export async function createOrganizationAction(data: { name: string; type: OrganizationType }) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const org = await createOrganization({
    name: data.name.trim(),
    type: data.type,
  })

  if (!org) {
    throw new Error('Failed to create organization')
  }

  // Add the user as an owner of the newly created organization
  await addMemberToOrganization(org.id, user.id, 'owner')

  return org
}

export async function inviteUserToOrganizationAction(
  organizationId: string,
  email: string,
  role: 'owner' | 'manager' | 'member' = 'member'
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Authentication required')
  }

  // Find user by email in profiles table (since we can't use admin API in client)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email.toLowerCase())
    .single()
  
  if (profileError || !profile) {
    // User doesn't exist yet - in MVP, we'll just return an error
    // In Phase 2, we could send an invitation email
    throw new Error(`User with email ${email} not found. They must sign up first.`)
  }

  // Add user to organization
  const member = await addMemberToOrganization(organizationId, profile.id, role)

  if (!member) {
    throw new Error('Failed to add user to organization')
  }

  return member
}

export async function removeUserFromOrganizationAction(
  organizationId: string,
  userId: string
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const result = await removeMemberFromOrganization(organizationId, userId)

  if (!result) {
    throw new Error('Failed to remove user from organization')
  }

  return { success: true }
}
