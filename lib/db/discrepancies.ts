// Database helper functions for Discrepancies
import { convexClient, api } from '@/lib/convex/server'
import { getConvexProfileId } from '@/lib/convex/profile-utils'
import type { 
  Discrepancy, 
  InsertDiscrepancy, 
  UpdateDiscrepancy 
} from '@/lib/types/database'
import { Id } from '../../convex/_generated/dataModel'

function convertDiscrepancy(doc: any): Discrepancy | null {
  if (!doc) return null;
  return {
    id: doc._id,
    ferry_flight_id: doc.ferryFlightId,
    description: doc.description,
    severity: doc.severity,
    affects_flight: doc.affectsFlight,
    affected_system: doc.affectedSystem || null,
    created_by: doc.createdBy || null,
    created_at: new Date(doc.createdAt).toISOString(),
    updated_at: new Date(doc.updatedAt).toISOString(),
  };
}

export async function getDiscrepanciesByFlight(flightId: string): Promise<Discrepancy[]> {
  try {
    const results = await convexClient.query(api["queries/discrepancies"].getDiscrepanciesByFlight, {
      flightId: flightId as Id<"ferryFlights">,
    });
    return results.map(convertDiscrepancy).filter((d): d is Discrepancy => d !== null);
  } catch (error) {
    console.error('Error fetching discrepancies:', error);
    return [];
  }
}

export async function createDiscrepancy(discrepancy: InsertDiscrepancy): Promise<Discrepancy | null> {
  try {
    // Convert Supabase user ID to Convex profile ID
    const createdByConvexId = discrepancy.created_by ? await getConvexProfileId(discrepancy.created_by) : undefined;
    
    if (discrepancy.created_by && !createdByConvexId) {
      console.error('Could not find Convex profile for creator:', discrepancy.created_by);
      return null;
    }
    
    const discrepancyId = await convexClient.mutation(api["mutations/discrepancies"].createDiscrepancy, {
      ferryFlightId: discrepancy.ferry_flight_id as Id<"ferryFlights">,
      description: discrepancy.description,
      severity: discrepancy.severity,
      affectsFlight: discrepancy.affects_flight,
      affectedSystem: discrepancy.affected_system || undefined,
      createdBy: createdByConvexId,
    });
    
    // Fetch the created discrepancy
    const allDiscrepancies = await getDiscrepanciesByFlight(discrepancy.ferry_flight_id);
    return allDiscrepancies.find(d => d.id === discrepancyId) || null;
  } catch (error) {
    console.error('Error creating discrepancy:', error);
    return null;
  }
}

export async function updateDiscrepancy(
  id: string, 
  updates: UpdateDiscrepancy
): Promise<Discrepancy | null> {
  try {
    await convexClient.mutation(api["mutations/discrepancies"].updateDiscrepancy, {
      id: id as Id<"discrepancies">,
      description: updates.description,
      severity: updates.severity,
      affectsFlight: updates.affects_flight,
      affectedSystem: updates.affected_system || undefined,
    });
    
    // Fetch updated discrepancy
    const flightId = updates.ferry_flight_id;
    if (!flightId) return null;
    
    const allDiscrepancies = await getDiscrepanciesByFlight(flightId);
    return allDiscrepancies.find(d => d.id === id) || null;
  } catch (error) {
    console.error('Error updating discrepancy:', error);
    return null;
  }
}

export async function deleteDiscrepancy(id: string): Promise<boolean> {
  try {
    await convexClient.mutation(api["mutations/discrepancies"].deleteDiscrepancy, {
      id: id as Id<"discrepancies">,
    });
    return true;
  } catch (error) {
    console.error('Error deleting discrepancy:', error);
    return false;
  }
}
