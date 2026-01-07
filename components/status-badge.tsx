import { Badge } from '@/components/ui/badge'
import type { FerryFlightStatus } from '@/lib/types/database'

interface StatusBadgeProps {
  status: FerryFlightStatus
}

const statusConfig: Record<FerryFlightStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  inspection_pending: { label: 'Inspection Pending', className: 'bg-yellow-100 text-yellow-700' },
  inspection_complete: { label: 'Inspection Complete', className: 'bg-blue-100 text-blue-700' },
  faa_submitted: { label: 'FAA Submitted', className: 'bg-purple-100 text-purple-700' },
  faa_questions: { label: 'FAA Questions', className: 'bg-orange-100 text-orange-700' },
  permit_issued: { label: 'Permit Issued', className: 'bg-green-100 text-green-700' },
  scheduled: { label: 'Scheduled', className: 'bg-sky-100 text-sky-700' },
  in_progress: { label: 'In Progress', className: 'bg-indigo-100 text-indigo-700' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
  aborted: { label: 'Aborted', className: 'bg-red-100 text-red-700' },
  denied: { label: 'Denied', className: 'bg-red-100 text-red-700' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}


