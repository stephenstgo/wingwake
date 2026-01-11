'use server'

import { uploadDocument, deleteDocument, getDocumentDownloadUrl } from '@/lib/db'

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

  // Validate file size (50MB limit)
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 50MB limit')
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`)
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

export async function getDocumentDownloadUrlAction(id: string) {
  return await getDocumentDownloadUrl(id)
}
