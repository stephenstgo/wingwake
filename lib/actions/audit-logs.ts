'use server'

import { getAuditLogsByFlight, getStatusHistory } from '@/lib/db/audit-logs'

export async function getFlightAuditLogsAction(flightId: string) {
  return await getAuditLogsByFlight(flightId)
}

export async function getFlightStatusHistoryAction(flightId: string) {
  return await getStatusHistory(flightId)
}
