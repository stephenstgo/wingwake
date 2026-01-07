'use server'

import { createFerryFlight, updateFerryFlight, updateFerryFlightStatus } from '@/lib/db'
import type { InsertFerryFlight, UpdateFerryFlight, FerryFlightStatus } from '@/lib/types/database'

export async function createFerryFlightAction(data: InsertFerryFlight) {
  return await createFerryFlight(data)
}

export async function updateFerryFlightAction(id: string, updates: UpdateFerryFlight) {
  return await updateFerryFlight(id, updates)
}

export async function updateFerryFlightStatusAction(id: string, status: FerryFlightStatus) {
  return await updateFerryFlightStatus(id, status)
}


