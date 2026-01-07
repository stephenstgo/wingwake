// Database helper functions for FAA Permits
import { createClient } from '@/lib/supabase/server'
import type { 
  FAAPermit, 
  InsertFAAPermit, 
  UpdateFAAPermit 
} from '@/lib/types/database'

export async function getPermitByFlight(flightId: string): Promise<FAAPermit | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('faa_permits')
    .select('*')
    .eq('ferry_flight_id', flightId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching permit:', error)
    return null
  }
  
  return data
}

export async function createPermit(permit: InsertFAAPermit): Promise<FAAPermit | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('faa_permits')
    .insert(permit)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating permit:', error)
    return null
  }
  
  return data
}

export async function updatePermit(
  id: string, 
  updates: UpdateFAAPermit
): Promise<FAAPermit | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('faa_permits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating permit:', error)
    return null
  }
  
  return data
}

export async function submitPermit(permitId: string, submittedVia: string): Promise<FAAPermit | null> {
  return updatePermit(permitId, {
    status: 'submitted',
    submitted_at: new Date().toISOString(),
    submitted_via: submittedVia,
  })
}

export async function approvePermit(
  permitId: string, 
  permitNumber: string,
  expiresAt: string,
  limitations?: string
): Promise<FAAPermit | null> {
  return updatePermit(permitId, {
    status: 'approved',
    approved_at: new Date().toISOString(),
    permit_number: permitNumber,
    expires_at: expiresAt,
    limitations_text: limitations,
  })
}

export async function denyPermit(permitId: string, reason?: string): Promise<FAAPermit | null> {
  return updatePermit(permitId, {
    status: 'denied',
  })
}


