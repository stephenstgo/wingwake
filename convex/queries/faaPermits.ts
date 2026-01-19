import { query } from "../_generated/server";
import { v } from "convex/values";

export const getPermitByFlight = query({
  args: { flightId: v.id("ferryFlights") },
  handler: async (ctx, args) => {
    const permits = await ctx.db
      .query("faaPermits")
      .withIndex("by_flight", (q) => q.eq("ferryFlightId", args.flightId))
      .order("desc")
      .collect();

    return permits[0] || null;
  },
});
