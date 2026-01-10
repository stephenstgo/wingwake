import type { FerryFlightStatus } from '@/lib/types/database'

export interface PhaseDefinition {
  id: string
  label: string
  description: string
  statuses: FerryFlightStatus[]
}

// Unified phase definitions used across dashboard and flight details
export const processPhases: PhaseDefinition[] = [
  {
    id: 'documentation',
    label: 'Documentation',
    description: 'Gathering required documents',
    statuses: ['draft', 'denied'],
  },
  {
    id: 'inspection',
    label: 'Inspection',
    description: 'Aircraft inspection in progress',
    statuses: ['inspection_pending', 'inspection_complete'],
  },
  {
    id: 'faa_review',
    label: 'FAA Review',
    description: 'Under FAA review',
    statuses: ['faa_submitted', 'faa_questions'],
  },
  {
    id: 'permit_approved',
    label: 'Permit Approved',
    description: 'Special flight permit issued',
    statuses: ['permit_issued'],
  },
  {
    id: 'ready_to_fly',
    label: 'Ready to Fly',
    description: 'All clear for departure',
    statuses: ['scheduled'],
  },
  {
    id: 'in_flight',
    label: 'In Flight',
    description: 'Ferry flight in progress',
    statuses: ['in_progress'],
  },
  {
    id: 'completed',
    label: 'Completed',
    description: 'Flight successfully completed',
    statuses: ['completed', 'aborted'],
  },
]

// Get the current phase index for a status
export function getCurrentPhaseIndex(status: FerryFlightStatus): number {
  for (let i = 0; i < processPhases.length; i++) {
    if (processPhases[i].statuses.includes(status)) {
      return i
    }
  }
  return 0
}

// Get the current phase for a status
export function getCurrentPhase(status: FerryFlightStatus): PhaseDefinition {
  const index = getCurrentPhaseIndex(status)
  return processPhases[index]
}
