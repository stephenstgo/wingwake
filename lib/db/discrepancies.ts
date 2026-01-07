// Database helper functions for Discrepancies
import { createClient } from '@/lib/supabase/server'
import type { 
  Discrepancy, 
  InsertDiscrepancy, 
  UpdateDiscrepancy 
} from '@/lib/types/database'

export async function getDiscrepanciesByFlight(flightId: string): Promise<Discrepancy[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('discrepancies')
    .select('*')
    .eq('ferry_flight_id', flightId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching discrepancies:', error)
    return []
  }
  
  return data || []
}

export async function createDiscrepancy(discrepancy: InsertDiscrepancy): Promise<Discrepancy | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  const { data, error } = await supabase
    .from('discrepancies')
    .insert({
      ...discrepancy,
      created_by: user.id,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating discrepancy:', error)
    return null
  }
  
  return data
}

export async function updateDiscrepancy(
  id: string, 
  updates: UpdateDiscrepancy
): Promise<Discrepancy | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('discrepancies')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating discrepancy:', error)
    return null
  }
  
  return data
}

export async function deleteDiscrepancy(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('discrepancies')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting discrepancy:', error)
    return false
  }
  
  return true
}


