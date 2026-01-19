import { query } from "../_generated/server";
import { v } from "convex/values";

export const getFerryFlight = query({
  args: { id: v.id("ferryFlights") },
  handler: async (ctx, args) => {
    const flight = await ctx.db.get(args.id);
    if (!flight) return null;

    // Load related data
    const [aircraft, owner, pilot, mechanic] = await Promise.all([
      flight.aircraftId ? ctx.db.get(flight.aircraftId) : null,
      flight.ownerId ? ctx.db.get(flight.ownerId) : null,
      flight.pilotUserId ? ctx.db.get(flight.pilotUserId) : null,
      flight.mechanicUserId ? ctx.db.get(flight.mechanicUserId) : null,
    ]);

    // Load related collections
    const [discrepancies, signoffs, permits, documents] = await Promise.all([
      ctx.db
        .query("discrepancies")
        .withIndex("by_flight", (q) => q.eq("ferryFlightId", args.id))
        .collect(),
      ctx.db
        .query("mechanicSignoffs")
        .withIndex("by_flight", (q) => q.eq("ferryFlightId", args.id))
        .collect(),
      ctx.db
        .query("faaPermits")
        .withIndex("by_flight", (q) => q.eq("ferryFlightId", args.id))
        .collect(),
      ctx.db
        .query("documents")
        .withIndex("by_flight", (q) => q.eq("ferryFlightId", args.id))
        .collect(),
    ]);

    return {
      ...flight,
      aircraft,
      owner,
      pilot,
      mechanic,
      discrepancies,
      mechanic_signoffs: signoffs,
      faa_permits: permits,
      documents,
    };
  },
});

export const getFerryFlightsByOwner = query({
  args: { ownerId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ferryFlights")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .order("desc")
      .collect();
  },
});

export const getFerryFlightsByCreator = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ferryFlights")
      .withIndex("by_created_by", (q) => q.eq("createdBy", args.userId))
      .order("desc")
      .collect();
  },
});

export const getUserFerryFlights = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    // Get user's organizations
    const members = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const orgIds = members.map((m) => m.organizationId);

    // Get flights where:
    // - created_by = userId
    // - pilot_user_id = userId
    // - mechanic_user_id = userId
    // - owner_id in user's organizations
    const [createdFlights, pilotFlights, mechanicFlights, ...ownerFlightsArrays] =
      await Promise.all([
        ctx.db
          .query("ferryFlights")
          .withIndex("by_created_by", (q) => q.eq("createdBy", args.userId))
          .collect(),
        ctx.db
          .query("ferryFlights")
          .withIndex("by_pilot", (q) => q.eq("pilotUserId", args.userId))
          .collect(),
        ctx.db
          .query("ferryFlights")
          .withIndex("by_mechanic", (q) => q.eq("mechanicUserId", args.userId))
          .collect(),
        ...orgIds.map((orgId) =>
          ctx.db
            .query("ferryFlights")
            .withIndex("by_owner", (q) => q.eq("ownerId", orgId))
            .collect()
        ),
      ]);

    // Combine and deduplicate
    const ownerFlights = ownerFlightsArrays.flat();
    const allFlights = [
      ...createdFlights,
      ...pilotFlights,
      ...mechanicFlights,
      ...ownerFlights,
    ];
    const uniqueFlights = Array.from(
      new Map(allFlights.map((f) => [f._id, f])).values()
    );

    return uniqueFlights.sort(
      (a, b) => b.createdAt - a.createdAt
    );
  },
});

export const getFerryFlightsByStatus = query({
  args: {
    status: v.union(
      v.literal("draft"),
      v.literal("inspection_pending"),
      v.literal("inspection_complete"),
      v.literal("faa_submitted"),
      v.literal("faa_questions"),
      v.literal("permit_issued"),
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("aborted"),
      v.literal("denied")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ferryFlights")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

// Get all flights (for demo/testing purposes)
export const getAllFerryFlights = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("ferryFlights")
      .order("desc")
      .collect();
  },
});
