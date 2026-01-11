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
    // Log more detailed error information
    console.error('Error fetching aircraft:', {
      message: aircraftError.message,
      code: aircraftError.code,
      details: aircraftError.details,
      hint: aircraftError.hint
    })
    
    // If it's a "not found" error (PGRST116), that's okay - return null
    if (aircraftError.code === 'PGRST116') {
      return null
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


