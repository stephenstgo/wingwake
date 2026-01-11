// Database helper functions for Audit Logs
import { createClient } from '@/lib/supabase/server'
import type { AuditLog } from '@/lib/types/database'

export async function getAuditLogsByFlight(flightId: string): Promise<AuditLog[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('ferry_flight_id', flightId)
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
  
  return data || []
}

export async function getStatusHistory(flightId: string): Promise<AuditLog[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('ferry_flight_id', flightId)
    .eq('action', 'status_changed')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching status history:', error)
    return []
  }
  
  return data || []
}
