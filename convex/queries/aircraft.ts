import { query } from "../_generated/server";
import { v } from "convex/values";

export const getAircraft = query({
  args: { id: v.id("aircraft") },
  handler: async (ctx, args) => {
    const aircraft = await ctx.db.get(args.id);
    if (!aircraft) return null;

    let owner = null;
    if (aircraft.ownerId) {
      owner = await ctx.db.get(aircraft.ownerId);
    }

    return { ...aircraft, owner };
  },
});

export const getAircraftByNNumber = query({
  args: { nNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aircraft")
      .withIndex("by_n_number", (q) => q.eq("nNumber", args.nNumber))
      .first();
  },
});

export const getAircraftBySupabaseId = query({
  args: { supabaseAircraftId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aircraft")
      .withIndex("by_supabase_aircraft_id", (q) => q.eq("supabaseAircraftId", args.supabaseAircraftId))
      .first();
  },
});

export const getAircraftByOwner = query({
  args: { ownerId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aircraft")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

export const getAllAircraftForUser = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    // Get user's organizations
    const members = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (members.length === 0) return [];

    const orgIds = members.map((m) => m.organizationId);
    const allAircraft = await Promise.all(
      orgIds.flatMap(async (orgId) => {
        return await ctx.db
          .query("aircraft")
          .withIndex("by_owner", (q) => q.eq("ownerId", orgId))
          .collect();
      })
    );

    return allAircraft.flat();
  },
});
