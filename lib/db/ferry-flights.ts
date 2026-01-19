// Database helper functions for Ferry Flights
import { convexClient, api } from '@/lib/convex/server'
import { getConvexProfileId } from '@/lib/convex/profile-utils'
import { ensureConvexProfile } from '@/lib/convex/ensure-profile'
import type { 
  FerryFlight, 
  InsertFerryFlight, 
  UpdateFerryFlight,
  FerryFlightWithRelations 
} from '@/lib/types/database'
import { Id } from '../../convex/_generated/dataModel'

// Helper to convert Convex document to FerryFlight type
function convertFerryFlight(doc: any): FerryFlight | null {
  if (!doc) return null;
  return {
    id: doc._id,
    aircraft_id: doc.aircraftId || null,
    tail_number: doc.tailNumber || null,
    owner_id: doc.ownerId || null,
    pilot_user_id: doc.pilotUserId || null,
    mechanic_user_id: doc.mechanicUserId || null,
    origin: doc.origin,
    destination: doc.destination,
    purpose: doc.purpose || null,
    status: doc.status,
    planned_departure: doc.plannedDeparture ? new Date(doc.plannedDeparture).toISOString() : null,
    actual_departure: doc.actualDeparture ? new Date(doc.actualDeparture).toISOString() : null,
    actual_arrival: doc.actualArrival ? new Date(doc.actualArrival).toISOString() : null,
    created_by: doc.createdBy || null,
    created_at: new Date(doc.createdAt).toISOString(),
    updated_at: new Date(doc.updatedAt).toISOString(),
  };
}

export async function getFerryFlight(id: string): Promise<FerryFlightWithRelations | null> {
  try {
    const result = await convexClient.query(api["queries/ferryFlights"].getFerryFlight, {
      id: id as Id<"ferryFlights">,
    });
    
    if (!result) return null;
    
    // Convert the result to match the expected type
    const flight = convertFerryFlight(result);
    if (!flight) return null;
    
    return {
      ...flight,
      aircraft: result.aircraft ? {
        id: result.aircraft._id,
        n_number: result.aircraft.nNumber,
        manufacturer: result.aircraft.manufacturer || null,
        model: result.aircraft.model || null,
        serial_number: result.aircraft.serialNumber || null,
        year: result.aircraft.year || null,
        base_location: result.aircraft.baseLocation || null,
        owner_id: result.aircraft.ownerId || null,
        created_at: new Date(result.aircraft.createdAt).toISOString(),
        updated_at: new Date(result.aircraft.updatedAt).toISOString(),
      } : undefined,
      owner: result.owner ? {
        id: result.owner._id,
        name: result.owner.name,
        type: result.owner.type,
        created_at: new Date(result.owner.createdAt).toISOString(),
        updated_at: new Date(result.owner.updatedAt).toISOString(),
      } : undefined,
      pilot: result.pilot ? {
        id: result.pilot._id,
        email: result.pilot.email || null,
        full_name: result.pilot.fullName || null,
        role: result.pilot.role,
        created_at: new Date(result.pilot.createdAt).toISOString(),
        updated_at: new Date(result.pilot.updatedAt).toISOString(),
      } : undefined,
      mechanic: result.mechanic ? {
        id: result.mechanic._id,
        email: result.mechanic.email || null,
        full_name: result.mechanic.fullName || null,
        role: result.mechanic.role,
        created_at: new Date(result.mechanic.createdAt).toISOString(),
        updated_at: new Date(result.mechanic.updatedAt).toISOString(),
      } : undefined,
      discrepancies: result.discrepancies?.map((d: any) => ({
        id: d._id,
        ferry_flight_id: d.ferryFlightId,
        description: d.description,
        severity: d.severity,
        affects_flight: d.affectsFlight,
        affected_system: d.affectedSystem || null,
        created_by: d.createdBy || null,
        created_at: new Date(d.createdAt).toISOString(),
        updated_at: new Date(d.updatedAt).toISOString(),
      })) || [],
      mechanic_signoffs: result.mechanic_signoffs?.map((s: any) => ({
        id: s._id,
        ferry_flight_id: s.ferryFlightId,
        mechanic_user_id: s.mechanicUserId,
        statement: s.statement,
        limitations: s.limitations || null,
        signed_at: new Date(s.signedAt).toISOString(),
        created_at: new Date(s.createdAt).toISOString(),
      })) || [],
      faa_permits: result.faa_permits?.map((p: any) => ({
        id: p._id,
        ferry_flight_id: p.ferryFlightId,
        status: p.status,
        submitted_at: p.submittedAt ? new Date(p.submittedAt).toISOString() : null,
        submitted_via: p.submittedVia || null,
        fsdo_mido: p.fsdoMido || null,
        approved_at: p.approvedAt ? new Date(p.approvedAt).toISOString() : null,
        expires_at: p.expiresAt ? new Date(p.expiresAt).toISOString() : null,
        permit_number: p.permitNumber || null,
        limitations: p.limitations || null,
        limitations_text: p.limitationsText || null,
        faa_contact_name: p.faaContactName || null,
        faa_contact_email: p.faaContactEmail || null,
        faa_questions: p.faaQuestions || null,
        faa_responses: p.faaResponses || null,
        created_at: new Date(p.createdAt).toISOString(),
        updated_at: new Date(p.updatedAt).toISOString(),
      })) || [],
      documents: result.documents?.map((d: any) => ({
        id: d._id,
        ferry_flight_id: d.ferryFlightId,
        uploaded_by: d.uploadedBy || null,
        file_name: d.fileName,
        file_path: d.filePath,
        file_size: d.fileSize || null,
        mime_type: d.mimeType || null,
        type: d.type || null,
        category: d.category || null,
        description: d.description || null,
        created_at: new Date(d.createdAt).toISOString(),
      })) || [],
    } as FerryFlightWithRelations;
  } catch (error) {
    console.error('Error fetching ferry flight:', error);
    return null;
  }
}

export async function getFerryFlightsByOwner(ownerId: string): Promise<FerryFlight[]> {
  try {
    const results = await convexClient.query(api["queries/ferryFlights"].getFerryFlightsByOwner, {
      ownerId: ownerId as Id<"organizations">,
    });
    
    return results.map(convertFerryFlight).filter((f): f is FerryFlight => f !== null);
  } catch (error) {
    console.error('Error fetching ferry flights:', error);
    return [];
  }
}

export async function getFerryFlightsByCreator(userId: string): Promise<FerryFlight[]> {
  try {
    // Convert Supabase user ID to Convex profile ID
    const convexProfileId = await getConvexProfileId(userId);
    if (!convexProfileId) {
      return [];
    }
    
    const results = await convexClient.query(api["queries/ferryFlights"].getFerryFlightsByCreator, {
      userId: convexProfileId,
    });
    
    return results.map(convertFerryFlight).filter((f): f is FerryFlight => f !== null);
  } catch (error) {
    console.error('Error fetching ferry flights by creator:', error);
    return [];
  }
}

export async function getUserFerryFlights(userId: string): Promise<FerryFlight[]> {
  try {
    // Ensure Convex profile exists, create if needed
    const convexProfileId = await ensureConvexProfile(userId);
    if (!convexProfileId) {
      return [];
    }
    
    const results = await convexClient.query(api["queries/ferryFlights"].getUserFerryFlights, {
      userId: convexProfileId,
    });
    
    return results.map(convertFerryFlight).filter((f): f is FerryFlight => f !== null);
  } catch (error) {
    console.error('Error fetching user ferry flights:', error);
    return [];
  }
}

export async function getFerryFlightsByStatus(status: string): Promise<FerryFlight[]> {
  try {
    const results = await convexClient.query(api["queries/ferryFlights"].getFerryFlightsByStatus, {
      status,
    });
    
    return results.map(convertFerryFlight).filter((f): f is FerryFlight => f !== null);
  } catch (error) {
    console.error('Error fetching ferry flights:', error);
    return [];
  }
}

export async function getAllFerryFlights(): Promise<FerryFlight[]> {
  try {
    const results = await convexClient.query(api["queries/ferryFlights"].getAllFerryFlights, {});
    
    return results.map(convertFerryFlight).filter((f): f is FerryFlight => f !== null);
  } catch (error) {
    console.error('Error fetching all ferry flights:', error);
    return [];
  }
}

export async function createFerryFlight(flight: InsertFerryFlight): Promise<FerryFlight | null> {
  try {
    // Convert Supabase user IDs to Convex profile IDs
    const createdByConvexId = flight.created_by ? await getConvexProfileId(flight.created_by) : undefined;
    const pilotConvexId = flight.pilot_user_id ? await getConvexProfileId(flight.pilot_user_id) : undefined;
    const mechanicConvexId = flight.mechanic_user_id ? await getConvexProfileId(flight.mechanic_user_id) : undefined;
    
    if (flight.created_by && !createdByConvexId) {
      throw new Error('Could not find Convex profile for creator');
    }
    
    const flightId = await convexClient.mutation(api["mutations/ferryFlights"].createFerryFlight, {
      aircraftId: flight.aircraft_id as Id<"aircraft"> | undefined,
      tailNumber: flight.tail_number || undefined,
      ownerId: flight.owner_id as Id<"organizations"> | undefined,
      pilotUserId: pilotConvexId,
      mechanicUserId: mechanicConvexId,
      origin: flight.origin,
      destination: flight.destination,
      purpose: flight.purpose || undefined,
      status: flight.status || "draft",
      plannedDeparture: flight.planned_departure ? new Date(flight.planned_departure).getTime() : undefined,
      actualDeparture: flight.actual_departure ? new Date(flight.actual_departure).getTime() : undefined,
      actualArrival: flight.actual_arrival ? new Date(flight.actual_arrival).getTime() : undefined,
      createdBy: createdByConvexId,
    });
    
    // Fetch the created flight
    return await getFerryFlight(flightId);
  } catch (error) {
    console.error('Error creating ferry flight:', error);
    throw error;
  }
}

export async function updateFerryFlight(
  id: string, 
  updates: UpdateFerryFlight
): Promise<FerryFlight | null> {
  try {
    // Convert Supabase user IDs to Convex profile IDs if provided
    const pilotConvexId = updates.pilot_user_id ? await getConvexProfileId(updates.pilot_user_id) : undefined;
    const mechanicConvexId = updates.mechanic_user_id ? await getConvexProfileId(updates.mechanic_user_id) : undefined;
    const userIdConvexId = updates.created_by ? await getConvexProfileId(updates.created_by) : undefined;
    
    await convexClient.mutation(api["mutations/ferryFlights"].updateFerryFlight, {
      id: id as Id<"ferryFlights">,
      aircraftId: updates.aircraft_id as Id<"aircraft"> | undefined,
      tailNumber: updates.tail_number || undefined,
      ownerId: updates.owner_id as Id<"organizations"> | undefined,
      pilotUserId: pilotConvexId,
      mechanicUserId: mechanicConvexId,
      origin: updates.origin || undefined,
      destination: updates.destination || undefined,
      purpose: updates.purpose || undefined,
      status: updates.status || undefined,
      plannedDeparture: updates.planned_departure ? new Date(updates.planned_departure).getTime() : undefined,
      actualDeparture: updates.actual_departure ? new Date(updates.actual_departure).getTime() : undefined,
      actualArrival: updates.actual_arrival ? new Date(updates.actual_arrival).getTime() : undefined,
      userId: userIdConvexId,
    });
    
    return await getFerryFlight(id);
  } catch (error) {
    console.error('Error updating ferry flight:', error);
    return null;
  }
}

export async function updateFerryFlightStatus(
  id: string, 
  status: FerryFlight['status']
): Promise<FerryFlight | null> {
  try {
    await convexClient.mutation(api["mutations/ferryFlights"].updateFerryFlightStatus, {
      id: id as Id<"ferryFlights">,
      status,
    });
    
    return await getFerryFlight(id);
  } catch (error) {
    console.error('Error updating ferry flight status:', error);
    return null;
  }
}

export async function checkReadyForFAASubmission(flightId: string): Promise<boolean> {
  // This would need to be implemented as a Convex query
  // For now, return false
  return false;
}

export async function getFlightsWaitingOnFAA() {
  // This would need to be implemented as a Convex query
  return [];
}

export async function getExpiringPermits(daysAhead: number = 7) {
  // This would need to be implemented as a Convex query
  return [];
}

export async function deleteFerryFlight(id: string): Promise<boolean> {
  try {
    await convexClient.mutation(api["mutations/ferryFlights"].deleteFerryFlight, {
      id: id as Id<"ferryFlights">,
    });
    return true;
  } catch (error) {
    console.error('Error deleting ferry flight:', error);
    return false;
  }
}
