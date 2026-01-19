// Database helper functions for Mechanic Sign-offs
import { convexClient, api } from '@/lib/convex/server'
import { getConvexProfileId } from '@/lib/convex/profile-utils'
import type { 
  MechanicSignoff, 
  InsertMechanicSignoff 
} from '@/lib/types/database'
import { Id } from '../../convex/_generated/dataModel'

function convertMechanicSignoff(doc: any): MechanicSignoff | null {
  if (!doc) return null;
  return {
    id: doc._id,
    ferry_flight_id: doc.ferryFlightId,
    mechanic_user_id: doc.mechanicUserId,
    statement: doc.statement,
    limitations: doc.limitations || null,
    signed_at: new Date(doc.signedAt).toISOString(),
    created_at: new Date(doc.createdAt).toISOString(),
  };
}

export async function getSignoffsByFlight(flightId: string): Promise<MechanicSignoff[]> {
  try {
    const results = await convexClient.query(api["queries/mechanicSignoffs"].getSignoffsByFlight, {
      flightId: flightId as Id<"ferryFlights">,
    });
    return results.map(convertMechanicSignoff).filter((s): s is MechanicSignoff => s !== null);
  } catch (error) {
    console.error('Error fetching signoffs:', error);
    return [];
  }
}

export async function getLatestSignoff(flightId: string): Promise<MechanicSignoff | null> {
  try {
    const result = await convexClient.query(api["queries/mechanicSignoffs"].getLatestSignoff, {
      flightId: flightId as Id<"ferryFlights">,
    });
    return convertMechanicSignoff(result);
  } catch (error) {
    console.error('Error fetching latest signoff:', error);
    return null;
  }
}

export async function createSignoff(signoff: InsertMechanicSignoff): Promise<MechanicSignoff | null> {
  try {
    // Convert Supabase user ID to Convex profile ID
    const mechanicConvexId = await getConvexProfileId(signoff.mechanic_user_id);
    
    if (!mechanicConvexId) {
      console.error('Could not find Convex profile for mechanic:', signoff.mechanic_user_id);
      return null;
    }
    
    const signoffId = await convexClient.mutation(api["mutations/mechanicSignoffs"].createSignoff, {
      ferryFlightId: signoff.ferry_flight_id as Id<"ferryFlights">,
      mechanicUserId: mechanicConvexId,
      statement: signoff.statement,
      limitations: signoff.limitations || undefined,
    });
    
    // Fetch the created signoff
    const allSignoffs = await getSignoffsByFlight(signoff.ferry_flight_id);
    return allSignoffs.find(s => s.id === signoffId) || null;
  } catch (error) {
    console.error('Error creating signoff:', error);
    return null;
  }
}

export async function checkSignoffComplete(flightId: string): Promise<boolean> {
  // This would need to be implemented as a Convex query
  // For now, return false
  return false;
}
