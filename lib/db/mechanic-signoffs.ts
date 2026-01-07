// Database helper functions for Mechanic Sign-offs
import { createClient } from '@/lib/supabase/server'
import type { 
  MechanicSignoff, 
  InsertMechanicSignoff 
} from '@/lib/types/database'

export async function getSignoffsByFlight(flightId: string): Promise<MechanicSignoff[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('mechanic_signoffs')
    .select('*')
    .eq('ferry_flight_id', flightId)
    .order('signed_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching signoffs:', error)
    return []
  }
  
  return data || []
}

export async function getLatestSignoff(flightId: string): Promise<MechanicSignoff | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('mechanic_signoffs')
    .select('*')
    .eq('ferry_flight_id', flightId)
    .order('signed_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching latest signoff:', error)
    return null
  }
  
  return data
}

export async function createSignoff(signoff: InsertMechanicSignoff): Promise<MechanicSignoff | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  // Verify user is a mechanic
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'mechanic') {
    throw new Error('Only mechanics can create signoffs')
  }
  
  const { data, error } = await supabase
    .from('mechanic_signoffs')
    .insert({
      ...signoff,
      mechanic_user_id: user.id,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating signoff:', error)
    return null
  }
  
  // Auto-update flight status if this is the first signoff
  const { data: existingSignoffs } = await supabase
    .from('mechanic_signoffs')
    .select('id')
    .eq('ferry_flight_id', signoff.ferry_flight_id)
  
  if (existingSignoffs && existingSignoffs.length === 1) {
    // First signoff - update flight status
    await supabase
      .from('ferry_flights')
      .update({ status: 'inspection_complete' })
      .eq('id', signoff.ferry_flight_id)
  }
  
  return data
}

export async function checkSignoffComplete(flightId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('check_mechanic_signoff_complete', { flight_id: flightId })
  
  if (error) {
    console.error('Error checking signoff:', error)
    return false
  }
  
  return data === true
}


