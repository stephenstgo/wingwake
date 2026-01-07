'use server'

import { createSignoff } from '@/lib/db'
import type { InsertMechanicSignoff } from '@/lib/types/database'

export async function createSignoffAction(data: InsertMechanicSignoff) {
  return await createSignoff(data)
}


