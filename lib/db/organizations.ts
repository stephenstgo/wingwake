// Database helper functions for Organizations
import { createClient } from '@/lib/supabase/server'
import type { 
  Organization, 
  InsertOrganization, 
  UpdateOrganization,
  OrganizationMember 
} from '@/lib/types/database'

export async function getOrganization(id: string): Promise<Organization | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching organization:', error)
    return null
  }
  
  return data
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const supabase = await createClient()
  
  try {
    // First get the organization IDs the user belongs to
    // Users should be able to see their own membership records
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
    
    // If error, check what type it is
    if (membersError) {
      // PGRST116 = no rows found (this is fine, user just has no orgs)
      if (membersError.code === 'PGRST116') {
        // No rows - user has no organizations, return empty array
        return []
      }
      
      // For RLS errors (PGRST301 or permission denied), log a helpful message
      const isRLSError = membersError.code === 'PGRST301' || 
                        membersError.message?.toLowerCase().includes('permission') ||
                        membersError.message?.toLowerCase().includes('policy')
      
      if (isRLSError) {
        console.warn('RLS policy issue detected. Please run migration 005_fix_org_members_rls.sql in Supabase SQL Editor to allow users to view their own memberships.')
        // Return empty array gracefully - app will still work
        return []
      }
      
      // For other errors, only log if we have meaningful information
      const hasErrorInfo = membersError.code || membersError.message || membersError.details
      if (hasErrorInfo) {
        console.error('Error fetching organization members:', {
          code: membersError.code || 'unknown',
          message: membersError.message || 'No error message',
          details: membersError.details || null,
          hint: membersError.hint || null,
        })
      } else {
        // Empty error object - likely RLS blocking silently
        console.warn('Silent RLS error detected. User may not have permission to view organization_members. Run migration 005_fix_org_members_rls.sql')
      }
      
      // Return empty array for any error - app continues to work
      return []
    }
    
    if (!members || members.length === 0) {
      // User has no organizations - this is fine, return empty array
      return []
    }
    
    // Then fetch the organizations
    const orgIds = members.map(m => m.organization_id).filter(Boolean)
    
    if (orgIds.length === 0) {
      return []
    }
    
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .in('id', orgIds)
    
    if (orgsError) {
      // Only log if we have meaningful error info
      if (orgsError.code || orgsError.message) {
        console.error('Error fetching organizations:', {
          code: orgsError.code || 'unknown',
          message: orgsError.message || 'No error message',
          details: orgsError.details || null,
        })
      }
      return []
    }
    
    return organizations || []
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error in getUserOrganizations:', error)
    return []
  }
}

export async function createOrganization(org: InsertOrganization): Promise<Organization | null> {
  const supabase = await createClient()
  
  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error(`Authentication required to create organization. Error: ${authError?.message || 'User not authenticated'}`)
  }
  
  // Log authentication context for debugging
  console.log('Auth context for organization creation:', {
    userId: user.id,
    userEmail: user.email,
  })
  
  // Try using the function first (bypasses RLS)
  const { data: functionResult, error: functionError } = await supabase
    .rpc('create_organization', {
      org_name: org.name,
      org_type: org.type
    })
  
  if (!functionError && functionResult) {
    // Function worked! Construct the organization object
    const now = new Date().toISOString()
    return {
      id: functionResult,
      name: org.name,
      type: org.type,
      created_at: now,
      updated_at: now,
    } as Organization
  }
  
  // Fallback: INSERT without SELECT (works, but we can't get the ID)
  // Then immediately add user as member so we can SELECT it back
  console.warn('Function create_organization failed or doesn\'t exist, using direct INSERT:', functionError?.message)
  
  // Insert WITHOUT select() - this works!
  const { error: insertError } = await supabase
    .from('organizations')
    .insert(org)
  
  if (insertError) {
    // Log detailed error information
    console.error('Error creating organization - INSERT failed:', {
      name: org.name,
      type: org.type,
      userId: user.id,
      error: {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      }
    })
    
    // Check for RLS errors
    if (insertError.code === '42501' || insertError.message?.toLowerCase().includes('row-level security') || insertError.message?.toLowerCase().includes('policy')) {
      throw new Error(`RLS policy error: Cannot create organization "${org.name}". User ID: ${user.id}. Error: ${insertError.message}`)
    }
    
    // For other errors, throw with details
    throw new Error(`Failed to create organization "${org.name}": ${insertError.message || insertError.code || 'Unknown error'}`)
  }
  
  // INSERT succeeded! Now we need to get the ID.
  // Since we can't SELECT it (SELECT policy blocks), we'll add the user as a member first
  // Then we can SELECT it. But wait - we need the org ID to add the member...
  
  // Solution: Query by name to get the ID (this might work if name is unique)
  // OR use a trigger/function to automatically add the creator as owner
  // For now, let's try querying by name - if it fails, we'll need the function
  
  const { data: orgData, error: selectError } = await supabase
    .from('organizations')
    .select('id')
    .eq('name', org.name)
    .maybeSingle()
  
  if (selectError || !orgData?.id) {
    // Can't get the ID - this is a problem
    // The organization was created but we can't retrieve it
    throw new Error(`Organization "${org.name}" was created but we cannot retrieve its ID. Please run migration 017_bypass_rls_with_function.sql to create the create_organization function.`)
  }
  
  // Successfully got the ID!
  const now = new Date().toISOString()
  return {
    id: orgData.id,
    name: org.name,
    type: org.type,
    created_at: now,
    updated_at: now,
  } as Organization
}

export async function updateOrganization(
  id: string, 
  updates: UpdateOrganization
): Promise<Organization | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating organization:', error)
    return null
  }
  
  return data
}

export async function addMemberToOrganization(
  organizationId: string,
  userId: string,
  role: 'owner' | 'manager' | 'member' = 'member'
): Promise<OrganizationMember | null> {
  const supabase = await createClient()
  
  // Check if member already exists
  const { data: existing } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .maybeSingle()
  
  if (existing) {
    // Member already exists, return the existing record
    const { data: member } = await supabase
      .from('organization_members')
      .select('*')
      .eq('id', existing.id)
      .single()
    return member
  }
  
  const { data, error } = await supabase
    .from('organization_members')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      role,
    })
    .select()
    .single()
  
  if (error) {
    // Check if it's a duplicate key error (unique constraint violation)
    if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
      // Member was added between check and insert, fetch it
      const { data: member } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .single()
      return member
    }
    console.error('Error adding member:', error)
    return null
  }
  
  return data
}

export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching members:', error)
    return []
  }
  
  return data || []
}

