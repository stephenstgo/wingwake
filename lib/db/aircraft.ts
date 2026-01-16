// Database helper functions for Aircraft
import { createClient } from '@/lib/supabase/server'
import type { 
  Aircraft, 
  InsertAircraft, 
  UpdateAircraft,
  AircraftWithOwner 
} from '@/lib/types/database'

export async function getAircraft(id: string): Promise<AircraftWithOwner | null> {
  const supabase = await createClient()
  
  // First, fetch the aircraft
  const { data: aircraft, error: aircraftError } = await supabase
    .from('aircraft')
    .select('*')
    .eq('id', id)
    .single()
  
  if (aircraftError) {
    // If it's a "not found" error (PGRST116), that's okay - return null silently
    if (aircraftError.code === 'PGRST116') {
      return null
    }
    
    // For RLS errors or other access issues, also return null silently
    // (aircraft might exist but user doesn't have access)
    if (aircraftError.code === 'PGRST301' || 
        aircraftError.message?.toLowerCase().includes('row-level security') ||
        aircraftError.message?.toLowerCase().includes('permission')) {
      return null
    }
    
    // Only log unexpected errors
    if (aircraftError.message || aircraftError.code) {
      console.error('Error fetching aircraft:', {
        message: aircraftError.message,
        code: aircraftError.code,
        details: aircraftError.details,
        hint: aircraftError.hint
      })
    }
    
    return null
  }
  
  if (!aircraft) {
    return null
  }
  
  // If aircraft has an owner_id, fetch the organization
  let owner = null
  if (aircraft.owner_id) {
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', aircraft.owner_id)
      .single()
    
    if (!orgError && org) {
      owner = org
    }
  }
  
  return {
    ...aircraft,
    owner
  } as AircraftWithOwner
}

export async function getAircraftByNNumber(nNumber: string): Promise<Aircraft | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('aircraft')
    .select('*')
    .eq('n_number', nNumber)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching aircraft:', error)
    return null
  }
  
  return data
}

export async function getAircraftByOwner(ownerId: string): Promise<Aircraft[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('aircraft')
    .select('*')
    .eq('owner_id', ownerId)
    .order('n_number', { ascending: true })
  
  if (error) {
    console.error('Error fetching aircraft:', error)
    return []
  }
  
  return data || []
}

export async function createAircraft(aircraft: InsertAircraft): Promise<Aircraft | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('aircraft')
    .insert(aircraft)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating aircraft:', error)
    return null
  }
  
  return data
}

export async function updateAircraft(
  id: string, 
  updates: UpdateAircraft
): Promise<Aircraft | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('aircraft')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating aircraft:', error)
    return null
  }
  
  return data
}

export async function deleteAircraft(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('aircraft')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting aircraft:', error)
    return false
  }
  
  return true
}

export async function getAllAircraftForUser(): Promise<Aircraft[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }
  
  // Get user's organizations
  const { data: members } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
  
  if (!members || members.length === 0) {
    return []
  }
  
  const orgIds = members.map(m => m.organization_id)
  
  // Get all aircraft owned by user's organizations
  const { data, error } = await supabase
    .from('aircraft')
    .select('*')
    .in('owner_id', orgIds)
    .order('n_number', { ascending: true })
  
  if (error) {
    console.error('Error fetching aircraft:', error)
    return []
  }
  
  return data || []
}


