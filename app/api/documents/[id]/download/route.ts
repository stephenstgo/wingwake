import { NextResponse } from 'next/server'
import { convexClient, api } from '@/lib/convex/server'
import { Id } from '@/convex/_generated/dataModel'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    // Get document to verify it exists
    const document = await convexClient.query(api["queries/documents"].getDocument, {
      id: id as Id<"documents">,
    });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    // Get download URL from Convex
    const downloadUrl = await convexClient.action(api["actions/documents"].getDocumentDownloadUrl, {
      documentId: id as Id<"documents">,
    });
    
    if (!downloadUrl) {
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }
    
    // Redirect to the download URL
    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json(
      { error: 'Failed to download document', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
