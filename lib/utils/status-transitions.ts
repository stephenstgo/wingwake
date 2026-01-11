import type { FerryFlightStatus } from '@/lib/types/database'

// Valid status transitions based on the workflow
export const VALID_TRANSITIONS: Record<FerryFlightStatus, FerryFlightStatus[]> = {
  draft: ['inspection_pending', 'denied'],
  inspection_pending: ['inspection_complete', 'draft'],
  inspection_complete: ['faa_submitted', 'draft'],
  faa_submitted: ['faa_questions', 'permit_issued', 'denied', 'draft'],
  faa_questions: ['faa_submitted', 'permit_issued', 'denied', 'draft'],
  permit_issued: ['scheduled', 'draft'],
  scheduled: ['in_progress', 'aborted', 'draft'],
  in_progress: ['completed', 'aborted'],
  completed: [], // Terminal state
  aborted: [], // Terminal state
  denied: ['draft'], // Can restart from draft
}

export function isValidTransition(
  from: FerryFlightStatus,
  to: FerryFlightStatus
): boolean {
  // Same status is always valid (no-op)
  if (from === to) {
    return true
  }

  // Check if transition is in the valid transitions list
  const validTargets = VALID_TRANSITIONS[from]
  return validTargets.includes(to)
}

export function getValidNextStatuses(currentStatus: FerryFlightStatus): FerryFlightStatus[] {
  return VALID_TRANSITIONS[currentStatus] || []
}

export function getStatusDisplayName(status: FerryFlightStatus): string {
  const names: Record<FerryFlightStatus, string> = {
    draft: 'Draft',
    inspection_pending: 'Inspection Pending',
    inspection_complete: 'Inspection Complete',
    faa_submitted: 'FAA Submitted',
    faa_questions: 'FAA Questions',
    permit_issued: 'Permit Issued',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    aborted: 'Aborted',
    denied: 'Denied',
  }
  return names[status] || status
}

export function getStatusDescription(status: FerryFlightStatus): string {
  const descriptions: Record<FerryFlightStatus, string> = {
    draft: 'Flight is being prepared',
    inspection_pending: 'Waiting for aircraft inspection',
    inspection_complete: 'Inspection completed, ready for FAA submission',
    faa_submitted: 'Permit application submitted to FAA',
    faa_questions: 'FAA has questions about the application',
    permit_issued: 'FAA permit has been issued',
    scheduled: 'Flight is scheduled',
    in_progress: 'Flight is currently in progress',
    completed: 'Flight has been completed',
    aborted: 'Flight was aborted',
    denied: 'FAA permit was denied',
  }
  return descriptions[status] || ''
}
