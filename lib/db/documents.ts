// Database helper functions for Documents
import { convexClient, api } from '@/lib/convex/server'
import type { 
  Document, 
  InsertDocument 
} from '@/lib/types/database'
import { Id } from '../../convex/_generated/dataModel'

function convertDocument(doc: any): Document | null {
  if (!doc) return null;
  return {
    id: doc._id,
    ferry_flight_id: doc.ferryFlightId,
    uploaded_by: doc.uploadedBy || null,
    file_name: doc.fileName,
    file_path: doc.filePath,
    file_size: doc.fileSize || null,
    mime_type: doc.mimeType || null,
    type: doc.type || null,
    category: doc.category || null,
    description: doc.description || null,
    created_at: new Date(doc.createdAt).toISOString(),
  };
}

export async function getDocumentsByFlight(flightId: string): Promise<Document[]> {
  try {
    const results = await convexClient.query(api["queries/documents"].getDocumentsByFlight, {
      flightId: flightId as Id<"ferryFlights">,
    });
    return results.map(convertDocument).filter((d): d is Document => d !== null);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export async function getDocumentsByCategory(flightId: string, category: string): Promise<Document[]> {
  try {
    const results = await convexClient.query(api["queries/documents"].getDocumentsByCategory, {
      flightId: flightId as Id<"ferryFlights">,
      category,
    });
    return results.map(convertDocument).filter((d): d is Document => d !== null);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export async function getDocumentCounts(flightId: string) {
  try {
    const results = await convexClient.query(api["queries/documents"].getDocumentCounts, {
      flightId: flightId as Id<"ferryFlights">,
    });
    return results;
  } catch (error) {
    console.error('Error fetching document counts:', error);
    return [];
  }
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
  try {
    // Get upload URL from Convex
    const uploadUrl = await convexClient.action(api["actions/documents"].getUploadUrl, {});
    
    // Upload file to Convex storage
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    
    if (!result.ok) {
      throw new Error(`Upload failed: ${result.statusText}`);
    }
    
    const { storageId } = await result.json();
    
    if (!storageId) {
      throw new Error('No storageId returned from upload');
    }
    
    // Create document record using the uploadDocument action
    const documentId = await convexClient.action(api["actions/documents"].uploadDocument, {
      ferryFlightId: flightId as Id<"ferryFlights">,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      type: metadata.type as any,
      category: metadata.category,
      description: metadata.description,
      storageId: storageId as Id<"_storage">,
    });
    
    // Fetch the created document
    const doc = await convexClient.query(api["queries/documents"].getDocument, {
      id: documentId as Id<"documents">,
    });
    
    return convertDocument(doc);
  } catch (error) {
    console.error('Error uploading document:', error);
    return null;
  }
}

export async function getDocumentDownloadUrl(documentId: string): Promise<string | null> {
  try {
    const url = await convexClient.action(api["actions/documents"].getDocumentDownloadUrl, {
      documentId: documentId as Id<"documents">,
    });
    return url;
  } catch (error) {
    console.error('Error creating download URL:', error);
    return null;
  }
}

export async function deleteDocument(id: string): Promise<boolean> {
  try {
    await convexClient.mutation(api["mutations/documents"].deleteDocument, {
      id: id as Id<"documents">,
    });
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}
