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
  
  const { data, error } = await supabase
    .from('aircraft')
    .select(`
      *,
      owner:owner_id (*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching aircraft:', error)
    return null
  }
  
  return data as AircraftWithOwner
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


