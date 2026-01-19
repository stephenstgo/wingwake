import { query } from "../_generated/server";
import { v } from "convex/values";

export const getSignoffsByFlight = query({
  args: { flightId: v.id("ferryFlights") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mechanicSignoffs")
      .withIndex("by_flight", (q) => q.eq("ferryFlightId", args.flightId))
      .order("desc")
      .collect();
  },
});

export const getLatestSignoff = query({
  args: { flightId: v.id("ferryFlights") },
  handler: async (ctx, args) => {
    const signoffs = await ctx.db
      .query("mechanicSignoffs")
      .withIndex("by_flight", (q) => q.eq("ferryFlightId", args.flightId))
      .order("desc")
      .collect();

    return signoffs[0] || null;
  },
});
