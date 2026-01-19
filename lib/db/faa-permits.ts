// Database helper functions for FAA Permits
import { convexClient, api } from '@/lib/convex/server'
import type { 
  FAAPermit, 
  InsertFAAPermit, 
  UpdateFAAPermit 
} from '@/lib/types/database'
import { Id } from '../../convex/_generated/dataModel'

function convertFAAPermit(doc: any): FAAPermit | null {
  if (!doc) return null;
  return {
    id: doc._id,
    ferry_flight_id: doc.ferryFlightId,
    status: doc.status,
    submitted_at: doc.submittedAt ? new Date(doc.submittedAt).toISOString() : null,
    submitted_via: doc.submittedVia || null,
    fsdo_mido: doc.fsdoMido || null,
    approved_at: doc.approvedAt ? new Date(doc.approvedAt).toISOString() : null,
    expires_at: doc.expiresAt ? new Date(doc.expiresAt).toISOString() : null,
    permit_number: doc.permitNumber || null,
    limitations: doc.limitations || null,
    limitations_text: doc.limitationsText || null,
    faa_contact_name: doc.faaContactName || null,
    faa_contact_email: doc.faaContactEmail || null,
    faa_questions: doc.faaQuestions || null,
    faa_responses: doc.faaResponses || null,
    created_at: new Date(doc.createdAt).toISOString(),
    updated_at: new Date(doc.updatedAt).toISOString(),
  };
}

export async function getPermitByFlight(flightId: string): Promise<FAAPermit | null> {
  try {
    const result = await convexClient.query(api["queries/faaPermits"].getPermitByFlight, {
      flightId: flightId as Id<"ferryFlights">,
    });
    return convertFAAPermit(result);
  } catch (error) {
    console.error('Error fetching permit:', error);
    return null;
  }
}

export async function createPermit(permit: InsertFAAPermit): Promise<FAAPermit | null> {
  try {
    const permitId = await convexClient.mutation(api["mutations/faaPermits"].createPermit, {
      ferryFlightId: permit.ferry_flight_id as Id<"ferryFlights">,
      status: permit.status || "draft",
      submittedAt: permit.submitted_at ? new Date(permit.submitted_at).getTime() : undefined,
      submittedVia: permit.submitted_via || undefined,
      fsdoMido: permit.fsdo_mido || undefined,
      approvedAt: permit.approved_at ? new Date(permit.approved_at).getTime() : undefined,
      expiresAt: permit.expires_at ? new Date(permit.expires_at).getTime() : undefined,
      permitNumber: permit.permit_number || undefined,
      limitations: permit.limitations || undefined,
      limitationsText: permit.limitations_text || undefined,
      faaContactName: permit.faa_contact_name || undefined,
      faaContactEmail: permit.faa_contact_email || undefined,
      faaQuestions: permit.faa_questions || undefined,
      faaResponses: permit.faa_responses || undefined,
    });
    
    return await getPermitByFlight(permit.ferry_flight_id);
  } catch (error) {
    console.error('Error creating permit:', error);
    return null;
  }
}

export async function updatePermit(
  id: string, 
  updates: UpdateFAAPermit
): Promise<FAAPermit | null> {
  try {
    await convexClient.mutation(api["mutations/faaPermits"].updatePermit, {
      id: id as Id<"faaPermits">,
      status: updates.status,
      submittedAt: updates.submitted_at ? new Date(updates.submitted_at).getTime() : undefined,
      submittedVia: updates.submitted_via || undefined,
      fsdoMido: updates.fsdo_mido || undefined,
      approvedAt: updates.approved_at ? new Date(updates.approved_at).getTime() : undefined,
      expiresAt: updates.expires_at ? new Date(updates.expires_at).getTime() : undefined,
      permitNumber: updates.permit_number || undefined,
      limitations: updates.limitations || undefined,
      limitationsText: updates.limitations_text || undefined,
      faaContactName: updates.faa_contact_name || undefined,
      faaContactEmail: updates.faa_contact_email || undefined,
      faaQuestions: updates.faa_questions || undefined,
      faaResponses: updates.faa_responses || undefined,
    });
    
    // Fetch updated permit - need flightId
    // This is a limitation - we'd need to store flightId or pass it
    return null;
  } catch (error) {
    console.error('Error updating permit:', error);
    return null;
  }
}

export async function submitPermit(permitId: string, submittedVia: string): Promise<FAAPermit | null> {
  try {
    await convexClient.mutation(api["mutations/faaPermits"].submitPermit, {
      permitId: permitId as Id<"faaPermits">,
      submittedVia,
    });
    return null; // Would need flightId to fetch
  } catch (error) {
    console.error('Error submitting permit:', error);
    return null;
  }
}

export async function approvePermit(
  permitId: string, 
  permitNumber: string,
  expiresAt: string,
  limitations?: string
): Promise<FAAPermit | null> {
  try {
    await convexClient.mutation(api["mutations/faaPermits"].approvePermit, {
      permitId: permitId as Id<"faaPermits">,
      permitNumber,
      expiresAt: new Date(expiresAt).getTime(),
      limitations,
    });
    return null; // Would need flightId to fetch
  } catch (error) {
    console.error('Error approving permit:', error);
    return null;
  }
}

export async function denyPermit(permitId: string, reason?: string): Promise<FAAPermit | null> {
  try {
    await convexClient.mutation(api["mutations/faaPermits"].denyPermit, {
      permitId: permitId as Id<"faaPermits">,
    });
    return null; // Would need flightId to fetch
  } catch (error) {
    console.error('Error denying permit:', error);
    return null;
  }
}
