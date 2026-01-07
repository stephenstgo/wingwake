'use server'

import { uploadDocument, deleteDocument } from '@/lib/db'

export async function uploadDocumentAction(
  flightId: string,
  formData: FormData
) {
  const file = formData.get('file') as File
  const type = formData.get('type') as string | null
  const category = formData.get('category') as string | null
  const description = formData.get('description') as string | null

  if (!file) {
    throw new Error('No file provided')
  }

  return await uploadDocument(flightId, file, {
    type: type as any,
    category: category || undefined,
    description: description || undefined,
  })
}

export async function deleteDocumentAction(id: string) {
  return await deleteDocument(id)
}


