// Database helper functions for Aircraft
import { convexClient, api } from '@/lib/convex/server'
import type { 
  Aircraft, 
  InsertAircraft, 
  UpdateAircraft,
  AircraftWithOwner 
} from '@/lib/types/database'
import { Id } from '../../convex/_generated/dataModel'

function convertAircraft(doc: any): Aircraft | null {
  if (!doc) return null;
  return {
    id: doc._id,
    n_number: doc.nNumber,
    manufacturer: doc.manufacturer || null,
    model: doc.model || null,
    serial_number: doc.serialNumber || null,
    year: doc.year || null,
    base_location: doc.baseLocation || null,
    owner_id: doc.ownerId || null,
    created_at: new Date(doc.createdAt).toISOString(),
    updated_at: new Date(doc.updatedAt).toISOString(),
  };
}

export async function getAircraft(id: string): Promise<AircraftWithOwner | null> {
  try {
    const result = await convexClient.query(api["queries/aircraft"].getAircraft, {
      id: id as Id<"aircraft">,
    });
    
    if (!result) return null;
    
    const aircraft = convertAircraft(result);
    if (!aircraft) return null;
    
    return {
      ...aircraft,
      owner: result.owner ? {
        id: result.owner._id,
        name: result.owner.name,
        type: result.owner.type,
        created_at: new Date(result.owner.createdAt).toISOString(),
        updated_at: new Date(result.owner.updatedAt).toISOString(),
      } : undefined,
    };
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return null;
  }
}

export async function getAircraftByNNumber(nNumber: string): Promise<Aircraft | null> {
  try {
    const result = await convexClient.query(api["queries/aircraft"].getAircraftByNNumber, {
      nNumber,
    });
    return convertAircraft(result);
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return null;
  }
}

export async function getAircraftByOwner(ownerId: string): Promise<Aircraft[]> {
  try {
    const results = await convexClient.query(api["queries/aircraft"].getAircraftByOwner, {
      ownerId: ownerId as Id<"organizations">,
    });
    return results.map(convertAircraft).filter((a): a is Aircraft => a !== null);
  } catch (error) {
    console.error('Error fetching aircraft:', error);
    return [];
  }
}

export async function createAircraft(aircraft: InsertAircraft): Promise<Aircraft | null> {
  try {
    const aircraftId = await convexClient.mutation(api["mutations/aircraft"].createAircraft, {
      nNumber: aircraft.n_number,
      manufacturer: aircraft.manufacturer || undefined,
      model: aircraft.model || undefined,
      serialNumber: aircraft.serial_number || undefined,
      year: aircraft.year || undefined,
      baseLocation: aircraft.base_location || undefined,
      ownerId: aircraft.owner_id as Id<"organizations"> | undefined,
    });
    
    return await getAircraft(aircraftId);
  } catch (error) {
    console.error('Error creating aircraft:', error);
    return null;
  }
}

export async function updateAircraft(
  id: string, 
  updates: UpdateAircraft
): Promise<Aircraft | null> {
  try {
    await convexClient.mutation(api["mutations/aircraft"].updateAircraft, {
      id: id as Id<"aircraft">,
      nNumber: updates.n_number,
      manufacturer: updates.manufacturer || undefined,
      model: updates.model || undefined,
      serialNumber: updates.serial_number || undefined,
      year: updates.year || undefined,
      baseLocation: updates.base_location || undefined,
      ownerId: updates.owner_id as Id<"organizations"> | undefined,
    });
    
    return await getAircraft(id);
  } catch (error) {
    console.error('Error updating aircraft:', error);
    return null;
  }
}

export async function deleteAircraft(id: string): Promise<boolean> {
  try {
    await convexClient.mutation(api["mutations/aircraft"].deleteAircraft, {
      id: id as Id<"aircraft">,
    });
    return true;
  } catch (error) {
    console.error('Error deleting aircraft:', error);
    return false;
  }
}

export async function getAllAircraftForUser(): Promise<Aircraft[]> {
  // Note: This requires userId from auth context
  // For now, return empty array - this needs to be called with userId
  return [];
}
