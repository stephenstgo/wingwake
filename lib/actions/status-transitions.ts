'use server'

import { updateFerryFlightStatus } from '@/lib/db/ferry-flights'
import { isValidTransition } from '@/lib/utils/status-transitions'
import type { FerryFlightStatus } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/server'

export async function transitionFlightStatus(
  flightId: string,
  newStatus: FerryFlightStatus,
  currentStatus?: FerryFlightStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  // If current status not provided, fetch it
  if (!currentStatus) {
    const { data: flight, error } = await supabase
      .from('ferry_flights')
      .select('status')
      .eq('id', flightId)
      .single()
    
    if (error || !flight) {
      return { success: false, error: 'Flight not found' }
    }
    
    currentStatus = flight.status
  }
  
  // Validate transition
  if (!isValidTransition(currentStatus, newStatus)) {
    return {
      success: false,
      error: `Invalid status transition from ${currentStatus} to ${newStatus}`
    }
  }
  
  // Perform the transition
  const result = await updateFerryFlightStatus(flightId, newStatus)
  
  if (!result) {
    return { success: false, error: 'Failed to update flight status' }
  }
  
  return { success: true }
}

// Specific transition helpers
export async function moveToInspectionPending(flightId: string, currentStatus?: FerryFlightStatus) {
  return transitionFlightStatus(flightId, 'inspection_pending', currentStatus)
}

export async function moveToInspectionComplete(flightId: string, currentStatus?: FerryFlightStatus) {
  return transitionFlightStatus(flightId, 'inspection_complete', currentStatus)
}

export async function moveToFAASubmitted(flightId: string, currentStatus?: FerryFlightStatus) {
  return transitionFlightStatus(flightId, 'faa_submitted', currentStatus)
}

export async function moveToPermitIssued(flightId: string, currentStatus?: FerryFlightStatus) {
  return transitionFlightStatus(flightId, 'permit_issued', currentStatus)
}

export async function moveToScheduled(flightId: string, currentStatus?: FerryFlightStatus) {
  return transitionFlightStatus(flightId, 'scheduled', currentStatus)
}

export async function moveToInProgress(flightId: string, currentStatus?: FerryFlightStatus) {
  return transitionFlightStatus(flightId, 'in_progress', currentStatus)
}

export async function moveToCompleted(flightId: string, currentStatus?: FerryFlightStatus) {
  return transitionFlightStatus(flightId, 'completed', currentStatus)
}

export async function moveToAborted(flightId: string, currentStatus?: FerryFlightStatus) {
  return transitionFlightStatus(flightId, 'aborted', currentStatus)
}

export async function moveToDenied(flightId: string, currentStatus?: FerryFlightStatus) {
  return transitionFlightStatus(flightId, 'denied', currentStatus)
}

export async function restartFromDraft(flightId: string, currentStatus?: FerryFlightStatus) {
  return transitionFlightStatus(flightId, 'draft', currentStatus)
}
