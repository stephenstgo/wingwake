'use client'

import { FerryFlightDetail } from './ferry-flight-detail'
import { StatusTimeline } from './status-history'
import { getFlightStatusHistoryAction } from '@/lib/actions/audit-logs'
import type { FerryFlightWithRelations } from '@/lib/types/database'

interface FerryFlightDetailWithHistoryProps {
  flight: FerryFlightWithRelations
  statusHistory: any[]
}

export function FerryFlightDetailWithHistory({ flight, statusHistory }: FerryFlightDetailWithHistoryProps) {
  return (
    <div className="space-y-6">
      <FerryFlightDetail flight={flight} />
      <StatusTimeline logs={statusHistory} />
    </div>
  )
}
