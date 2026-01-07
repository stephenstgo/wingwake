'use server'

import { createDiscrepancy, deleteDiscrepancy } from '@/lib/db'
import type { InsertDiscrepancy } from '@/lib/types/database'

export async function createDiscrepancyAction(data: InsertDiscrepancy) {
  return await createDiscrepancy(data)
}

export async function deleteDiscrepancyAction(id: string) {
  return await deleteDiscrepancy(id)
}


