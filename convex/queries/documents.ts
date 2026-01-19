import { query } from "../_generated/server";
import { v } from "convex/values";

export const getDocumentsByFlight = query({
  args: { flightId: v.id("ferryFlights") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_flight", (q) => q.eq("ferryFlightId", args.flightId))
      .order("desc")
      .collect();
  },
});

export const getDocumentsByCategory = query({
  args: {
    flightId: v.id("ferryFlights"),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const allDocs = await ctx.db
      .query("documents")
      .withIndex("by_flight", (q) => q.eq("ferryFlightId", args.flightId))
      .collect();

    return allDocs.filter((doc) => doc.category === args.category);
  },
});

export const getDocumentCounts = query({
  args: { flightId: v.id("ferryFlights") },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_flight", (q) => q.eq("ferryFlightId", args.flightId))
      .collect();

    const counts: Record<string, number> = {};
    documents.forEach((doc) => {
      const key = doc.type || "other";
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  },
});

export const getDocument = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
