// Database helper functions for Documents
import { createClient } from '@/lib/supabase/server'
import type { 
  Document, 
  InsertDocument 
} from '@/lib/types/database'

export async function getDocumentsByFlight(flightId: string): Promise<Document[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('ferry_flight_id', flightId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching documents:', error)
    return []
  }
  
  return data || []
}

export async function getDocumentsByCategory(flightId: string, category: string): Promise<Document[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('ferry_flight_id', flightId)
    .eq('category', category)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching documents:', error)
    return []
  }
  
  return data || []
}

export async function getDocumentCounts(flightId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('get_flight_document_counts', { flight_id: flightId })
  
  if (error) {
    console.error('Error fetching document counts:', error)
    return []
  }
  
  return data || []
}

export async function uploadDocument(
  flightId: string,
  file: File,
  metadata: {
    type?: string;
    category?: string;
    description?: string;
  }
): Promise<Document | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  // Upload file to Supabase Storage
  // Use the storage path format: {ferry_flight_id}/{timestamp}_{filename}
  const fileExt = file.name.split('.').pop()
  const timestamp = Date.now()
  const fileName = `${timestamp}_${file.name}`
  const filePath = `${flightId}/${fileName}`
  
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    return null
  }
  
  // Create document record
  const { data, error } = await supabase
    .from('documents')
    .insert({
      ferry_flight_id: flightId,
      uploaded_by: user.id,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      type: metadata.type || null,
      category: metadata.category || null,
      description: metadata.description || null,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating document record:', error)
    // Try to delete uploaded file
    await supabase.storage.from('documents').remove([filePath])
    return null
  }
  
  return data
}

export async function getDocumentDownloadUrl(documentId: string): Promise<string | null> {
  const supabase = await createClient()
  
  // Get document to find file path
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', documentId)
    .single()
  
  if (fetchError || !document) {
    console.error('Error fetching document:', fetchError)
    return null
  }
  
  // Generate a signed URL for download (valid for 1 hour)
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(document.file_path, 3600)
  
  if (error || !data) {
    console.error('Error creating signed URL:', error)
    return null
  }
  
  return data.signedUrl
}

export async function deleteDocument(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Get document to find file path
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', id)
    .single()
  
  if (fetchError || !document) {
    console.error('Error fetching document:', fetchError)
    return false
  }
  
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([document.file_path])
  
  if (storageError) {
    console.error('Error deleting file from storage:', storageError)
  }
  
  // Delete record
  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
  
  if (deleteError) {
    console.error('Error deleting document record:', deleteError)
    return false
  }
  
  return true
}


