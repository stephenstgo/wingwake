import { query } from "../_generated/server";
import { v } from "convex/values";

export const getAuditLogsByFlight = query({
  args: { flightId: v.id("ferryFlights") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_flight", (q) => q.eq("ferryFlightId", args.flightId))
      .order("desc")
      .take(100);
  },
});

export const getStatusHistory = query({
  args: { flightId: v.id("ferryFlights") },
  handler: async (ctx, args) => {
    const allLogs = await ctx.db
      .query("auditLogs")
      .withIndex("by_flight", (q) => q.eq("ferryFlightId", args.flightId))
      .collect();

    return allLogs
      .filter((log) => log.action === "status_changed")
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});
