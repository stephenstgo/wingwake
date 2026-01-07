'use server'

import { createPermit, submitPermit } from '@/lib/db'
import type { InsertFAAPermit } from '@/lib/types/database'

export async function createPermitAction(data: InsertFAAPermit) {
  return await createPermit(data)
}

export async function submitPermitAction(permitId: string, submittedVia: string) {
  return await submitPermit(permitId, submittedVia)
}


