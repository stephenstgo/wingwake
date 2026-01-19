import { query } from "../_generated/server";
import { v } from "convex/values";

export const getDiscrepanciesByFlight = query({
  args: { flightId: v.id("ferryFlights") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("discrepancies")
      .withIndex("by_flight", (q) => q.eq("ferryFlightId", args.flightId))
      .order("desc")
      .collect();
  },
});
