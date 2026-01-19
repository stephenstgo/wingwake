"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

// Dynamic import for Supabase (only used for migration)
// Supabase is not installed by default - this migration is optional
async function getSupabaseClient(url: string, key: string) {
  try {
    // Use dynamic import to avoid build errors when Supabase is not installed
    // @ts-ignore - Supabase is optional, only needed for migration
    const supabaseModule = await import("@supabase/supabase-js");
    const { createClient } = supabaseModule;
    return createClient(url, key);
  } catch (error) {
    throw new Error(
      "Supabase client not available. To use this migration, install @supabase/supabase-js:\n" +
      "  npm install @supabase/supabase-js\n\n" +
      "Note: This migration is optional and only needed if you want to migrate data from Supabase."
    );
  }
}

// Helper to get or create Convex profile from Supabase user ID
async function getOrCreateConvexProfile(
  ctx: any,
  supabaseUserId: string,
  supabaseProfile: any
): Promise<Id<"profiles"> | null> {
  // Check if profile exists
  const existing = await ctx.runQuery((api as any)["queries/profiles"].getProfileBySupabaseUserId, {
    supabaseUserId,
  });

  if (existing) {
    return existing._id;
  }

  // Create new profile
  const profileId = await ctx.runMutation((api as any)["mutations/profiles"].createProfile, {
    supabaseUserId,
    email: supabaseProfile?.email || undefined,
    fullName: supabaseProfile?.full_name || undefined,
    role: (supabaseProfile?.role as any) || "viewer",
  });

  return profileId;
}

// Helper to get or create Convex organization from Supabase org
async function getOrCreateConvexOrganization(
  ctx: any,
  supabaseOrgId: string,
  supabaseOrg: any
): Promise<Id<"organizations"> | null> {
  // Check if organization already exists
  const existing = await ctx.runQuery((api as any)["queries/organizations"].getOrganizationBySupabaseId, {
    supabaseOrgId,
  });

  if (existing) {
    return existing._id;
  }

  // Create new organization
  const orgId = await ctx.runMutation((api as any)["mutations/organizations"].createOrganization, {
    supabaseOrgId,
    name: supabaseOrg?.name || `Organization ${supabaseOrgId.slice(0, 8)}`,
    type: (supabaseOrg?.type as any) || "individual",
  });

  return orgId;
}

// Helper to get or create Convex aircraft from Supabase aircraft
async function getOrCreateConvexAircraft(
  ctx: any,
  supabaseAircraftId: string,
  supabaseAircraft: any,
  ownerIdMap: Map<string, Id<"organizations">>
): Promise<Id<"aircraft"> | null> {
  // Check if aircraft already exists by Supabase ID
  const existingBySupabaseId = await ctx.runQuery((api as any)["queries/aircraft"].getAircraftBySupabaseId, {
    supabaseAircraftId,
  });

  if (existingBySupabaseId) {
    return existingBySupabaseId._id;
  }

  // Check if aircraft exists by N-number
  if (supabaseAircraft?.n_number) {
    const existing = await ctx.runQuery((api as any)["queries/aircraft"].getAircraftByNNumber, {
      nNumber: supabaseAircraft.n_number,
    });

    if (existing) {
      return existing._id;
    }
  }

  // Get owner ID if aircraft has one
  const ownerId = supabaseAircraft?.owner_id
    ? ownerIdMap.get(supabaseAircraft.owner_id)
    : undefined;

  // Create new aircraft
  const aircraftId = await ctx.runMutation((api as any)["mutations/aircraft"].createAircraft, {
    supabaseAircraftId,
    nNumber: supabaseAircraft?.n_number || `N${supabaseAircraftId.slice(0, 6).toUpperCase()}`,
    manufacturer: supabaseAircraft?.manufacturer || undefined,
    model: supabaseAircraft?.model || undefined,
    serialNumber: supabaseAircraft?.serial_number || undefined,
    year: supabaseAircraft?.year || undefined,
    baseLocation: supabaseAircraft?.base_location || undefined,
    ownerId,
  });

  return aircraftId;
}

export const migrateFlightsFromSupabase = action({
  args: {
    supabaseUrl: v.optional(v.string()),
    supabaseKey: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; migrated: number; errors: string[] }> => {
    // Get credentials from args or environment
    const supabaseUrl = args.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = args.supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not found. Please provide supabaseUrl and supabaseKey as arguments, or set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
    }

    // Use dynamic import to avoid build errors when Supabase is not installed
    const supabase = await getSupabaseClient(supabaseUrl, supabaseKey);

    // Fetch all flights from Supabase
    const { data: flights, error: flightsError } = await supabase
      .from("ferry_flights")
      .select("*")
      .order("created_at", { ascending: true });

    if (flightsError) {
      throw new Error(`Failed to fetch flights: ${flightsError.message}`);
    }

    if (!flights || flights.length === 0) {
      return { 
        success: true, 
        migrated: 0, 
        errors: [`No flights found in Supabase. Found ${flights?.length || 0} flights.`] 
      };
    }

    // Fetch related data in batches
    const userIds = new Set<string>();
    const orgIds = new Set<string>();
    const aircraftIds = new Set<string>();

    flights.forEach((flight: any) => {
      if (flight.created_by) userIds.add(flight.created_by);
      if (flight.pilot_user_id) userIds.add(flight.pilot_user_id);
      if (flight.mechanic_user_id) userIds.add(flight.mechanic_user_id);
      if (flight.owner_id) orgIds.add(flight.owner_id);
      if (flight.aircraft_id) aircraftIds.add(flight.aircraft_id);
    });

    // Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", Array.from(userIds));

    const profileMap = new Map((profiles?.map((p: any) => [p.id, p]) || []) as [string, any][]);

    // Fetch organizations
    const { data: organizations } = await supabase
      .from("organizations")
      .select("*")
      .in("id", Array.from(orgIds));

    const orgMap = new Map((organizations?.map((o: any) => [o.id, o]) || []) as [string, any][]);

    // Fetch aircraft
    const { data: aircraft } = await supabase
      .from("aircraft")
      .select("*")
      .in("id", Array.from(aircraftIds));

    const aircraftMap = new Map((aircraft?.map((a: any) => [a.id, a]) || []) as [string, any][]);

    // Create ID mappings
    const profileIdMap = new Map<string, Id<"profiles">>();
    const orgIdMap = new Map<string, Id<"organizations">>();
    const aircraftIdMap = new Map<string, Id<"aircraft">>();

    // Create/get Convex profiles
    for (const [supabaseId, profile] of profileMap) {
      const convexId = await getOrCreateConvexProfile(ctx, supabaseId, profile);
      if (convexId) {
        profileIdMap.set(supabaseId, convexId);
      }
    }

    // Create/get Convex organizations
    for (const [supabaseId, org] of orgMap) {
      const convexId = await getOrCreateConvexOrganization(ctx, supabaseId, org);
      if (convexId) {
        orgIdMap.set(supabaseId, convexId);
      }
    }

    // Create/get Convex aircraft (need orgIdMap for owner references)
    for (const [supabaseId, aircraftData] of aircraftMap) {
      const convexId = await getOrCreateConvexAircraft(ctx, supabaseId, aircraftData, orgIdMap);
      if (convexId) {
        aircraftIdMap.set(supabaseId, convexId);
      }
    }

    // Migrate flights
    let migrated = 0;
    const errors: string[] = [];

    for (const flight of flights) {
      try {
        // Get Convex IDs
        const createdBy = flight.created_by
          ? profileIdMap.get(flight.created_by)
          : undefined;
        const pilotUserId = flight.pilot_user_id
          ? profileIdMap.get(flight.pilot_user_id)
          : undefined;
        const mechanicUserId = flight.mechanic_user_id
          ? profileIdMap.get(flight.mechanic_user_id)
          : undefined;
        const ownerId = flight.owner_id ? orgIdMap.get(flight.owner_id) : undefined;
        const aircraftId = flight.aircraft_id
          ? aircraftIdMap.get(flight.aircraft_id)
          : undefined;

        if (!createdBy) {
          errors.push(`Flight ${flight.id}: No Convex profile for creator`);
          continue;
        }

        // Convert dates to timestamps
        const plannedDeparture = flight.planned_departure
          ? new Date(flight.planned_departure).getTime()
          : undefined;
        const actualDeparture = flight.actual_departure
          ? new Date(flight.actual_departure).getTime()
          : undefined;
        const actualArrival = flight.actual_arrival
          ? new Date(flight.actual_arrival).getTime()
          : undefined;

        // Preserve original timestamps from Supabase
        const createdAt = flight.created_at
          ? new Date(flight.created_at).getTime()
          : undefined;
        const updatedAt = flight.updated_at
          ? new Date(flight.updated_at).getTime()
          : undefined;

        // Create flight in Convex
        await ctx.runMutation((api as any)["mutations/ferryFlights"].createFerryFlight, {
          aircraftId,
          tailNumber: flight.tail_number || undefined,
          ownerId,
          pilotUserId,
          mechanicUserId,
          origin: flight.origin,
          destination: flight.destination,
          purpose: flight.purpose || undefined,
          status: (flight.status as any) || "draft",
          plannedDeparture,
          actualDeparture,
          actualArrival,
          createdBy,
          createdAt,
          updatedAt,
        });

        migrated++;
      } catch (error) {
        errors.push(
          `Flight ${flight.id}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    return {
      success: true,
      migrated,
      errors: errors.slice(0, 50), // Limit errors
    };
  },
});
