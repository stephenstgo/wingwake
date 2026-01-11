import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Get document to find file path and verify access
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('file_path, file_name, ferry_flight_id')
    .eq('id', id)
    .single()
  
  if (fetchError || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }
  
  // Verify user has access to the ferry flight (RLS will handle this, but we check explicitly)
  const { data: flight, error: flightError } = await supabase
    .from('ferry_flights')
    .select('id')
    .eq('id', document.ferry_flight_id)
    .single()
  
  if (flightError || !flight) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }
  
  // Generate a signed URL for download (valid for 1 hour)
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(document.file_path, 3600)
  
  if (error || !data) {
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 })
  }
  
  // Redirect to the signed URL
  return NextResponse.redirect(data.signedUrl)
}
