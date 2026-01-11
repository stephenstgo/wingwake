'use server'

import { createAircraft, updateAircraft, deleteAircraft } from '@/lib/db/aircraft'
import type { InsertAircraft, UpdateAircraft } from '@/lib/types/database'

export async function createAircraftAction(data: InsertAircraft) {
  return await createAircraft(data)
}

export async function updateAircraftAction(id: string, updates: UpdateAircraft) {
  return await updateAircraft(id, updates)
}

export async function deleteAircraftAction(id: string) {
  const { deleteAircraft } = await import('@/lib/db/aircraft')
  const result = await deleteAircraft(id)
  return { success: result }
}
