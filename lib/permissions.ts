// User Roles and Permissions System
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types/database'

export type Permission = 
  | 'ferry_flight:create'
  | 'ferry_flight:update'
  | 'ferry_flight:delete'
  | 'ferry_flight:view'
  | 'discrepancy:create'
  | 'discrepancy:update'
  | 'discrepancy:delete'
  | 'mechanic_signoff:create'
  | 'faa_permit:create'
  | 'faa_permit:update'
  | 'faa_permit:submit'
  | 'document:upload'
  | 'document:delete'
  | 'aircraft:create'
  | 'aircraft:update'
  | 'organization:manage'
  | 'pilot:update_status'

// Permission matrix: role -> permissions
const PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'ferry_flight:create',
    'ferry_flight:update',
    'ferry_flight:delete',
    'ferry_flight:view',
    'discrepancy:create',
    'discrepancy:update',
    'discrepancy:delete',
    'mechanic_signoff:create',
    'faa_permit:create',
    'faa_permit:update',
    'faa_permit:submit',
    'document:upload',
    'document:delete',
    'aircraft:create',
    'aircraft:update',
    'organization:manage',
    'pilot:update_status',
  ],
  owner: [
    'ferry_flight:create',
    'ferry_flight:update',
    'ferry_flight:view',
    'faa_permit:create',
    'faa_permit:update',
    'faa_permit:submit',
    'document:upload',
    'document:delete',
    'aircraft:create',
    'aircraft:update',
    'organization:manage',
  ],
  mechanic: [
    'ferry_flight:view',
    'discrepancy:create',
    'discrepancy:update',
    'discrepancy:delete',
    'mechanic_signoff:create',
    'document:upload',
  ],
  pilot: [
    'ferry_flight:view',
    'pilot:update_status',
    'document:upload',
  ],
  viewer: [
    'ferry_flight:view',
  ],
}

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  return profile?.role || 'viewer'
}

export async function hasPermission(permission: Permission): Promise<boolean> {
  const role = await getUserRole()
  if (!role) {
    return false
  }
  
  return PERMISSIONS[role].includes(permission)
}

export async function requirePermission(permission: Permission): Promise<void> {
  const has = await hasPermission(permission)
  if (!has) {
    throw new Error(`Permission denied: ${permission}`)
  }
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return PERMISSIONS[role] || []
}

// Check if user can access a specific ferry flight
export async function canAccessFerryFlight(flightId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return false
  }
  
  // Check if user is admin
  const role = await getUserRole()
  if (role === 'admin') {
    return true
  }
  
  // Check if user is associated with the flight
  const { data: flight } = await supabase
    .from('ferry_flights')
    .select('owner_id, pilot_user_id, mechanic_user_id, created_by')
    .eq('id', flightId)
    .single()
  
  if (!flight) {
    return false
  }
  
  // Check if user is owner (via organization)
  if (flight.owner_id) {
    const { data: member } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', flight.owner_id)
      .eq('user_id', user.id)
      .single()
    
    if (member) {
      return true
    }
  }
  
  // Check if user is pilot, mechanic, or creator
  return (
    flight.pilot_user_id === user.id ||
    flight.mechanic_user_id === user.id ||
    flight.created_by === user.id
  )
}

// Check if user can manage an organization
export async function canManageOrganization(organizationId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return false
  }
  
  const role = await getUserRole()
  if (role === 'admin') {
    return true
  }
  
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()
  
  return member?.role === 'owner' || member?.role === 'manager'
}


