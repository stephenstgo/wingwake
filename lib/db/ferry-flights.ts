// Database helper functions for Ferry Flights
import { createClient } from '@/lib/supabase/server'
import type { 
  FerryFlight, 
  InsertFerryFlight, 
  UpdateFerryFlight,
  FerryFlightWithRelations 
} from '@/lib/types/database'

export async function getFerryFlight(id: string): Promise<FerryFlightWithRelations | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ferry_flights')
    .select(`
      *,
      aircraft:aircraft_id (*),
      owner:owner_id (*),
      pilot:pilot_user_id (*),
      mechanic:mechanic_user_id (*),
      discrepancies (*),
      mechanic_signoffs (*),
      faa_permits (*),
      documents (*)
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching ferry flight:', error)
    return null
  }
  
  return data as FerryFlightWithRelations
}

export async function getFerryFlightsByOwner(ownerId: string): Promise<FerryFlight[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ferry_flights')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching ferry flights:', error)
    return []
  }
  
  return data || []
}

export async function getFerryFlightsByStatus(status: string): Promise<FerryFlight[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ferry_flights')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching ferry flights:', error)
    return []
  }
  
  return data || []
}

export async function createFerryFlight(flight: InsertFerryFlight): Promise<FerryFlight | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  // Insert without select() first to avoid SELECT policy blocking
  const { error: insertError } = await supabase
    .from('ferry_flights')
    .insert({
      ...flight,
      created_by: user.id,
    })
  
  if (insertError) {
    console.error('Error creating ferry flight:', {
      flight: flight,
      userId: user.id,
      error: {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      }
    })
    
    // Check for RLS errors
    if (insertError.code === '42501' || insertError.message?.toLowerCase().includes('row-level security')) {
      throw new Error(`RLS policy error: Cannot create ferry flight. Error: ${insertError.message}`)
    }
    
    throw new Error(`Failed to create ferry flight: ${insertError.message || insertError.code || 'Unknown error'}`)
  }
  
  // INSERT succeeded, but we can't SELECT it back due to SELECT policy
  // Try to query by unique combination to get the ID
  const { data: flightData, error: selectError } = await supabase
    .from('ferry_flights')
    .select('*')
    .eq('aircraft_id', flight.aircraft_id)
    .eq('origin', flight.origin)
    .eq('destination', flight.destination)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (selectError) {
    console.warn('Could not retrieve created flight due to SELECT policy, but INSERT succeeded:', selectError.message)
    // Flight was created but we can't retrieve it - return null
    // The caller should handle this gracefully
    return null
  }
  
  return flightData
}

export async function updateFerryFlight(
  id: string, 
  updates: UpdateFerryFlight
): Promise<FerryFlight | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('ferry_flights')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating ferry flight:', error)
    return null
  }
  
  return data
}

export async function updateFerryFlightStatus(
  id: string, 
  status: FerryFlight['status']
): Promise<FerryFlight | null> {
  return updateFerryFlight(id, { status })
}

export async function checkReadyForFAASubmission(flightId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('is_ready_for_faa_submission', { flight_id: flightId })
  
  if (error) {
    console.error('Error checking FAA readiness:', error)
    return false
  }
  
  return data === true
}

export async function getFlightsWaitingOnFAA() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('get_flights_waiting_on_faa')
  
  if (error) {
    console.error('Error fetching flights waiting on FAA:', error)
    return []
  }
  
  return data || []
}

export async function getExpiringPermits(daysAhead: number = 7) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('get_expiring_permits', { days_ahead: daysAhead })
  
  if (error) {
    console.error('Error fetching expiring permits:', error)
    return []
  }
  
  return data || []
}

