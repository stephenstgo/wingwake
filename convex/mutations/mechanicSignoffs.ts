import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const createSignoff = mutation({
  args: {
    ferryFlightId: v.id("ferryFlights"),
    mechanicUserId: v.id("profiles"),
    statement: v.string(),
    limitations: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify user is a mechanic
    const profile = await ctx.db.get(args.mechanicUserId);
    if (!profile || profile.role !== "mechanic") {
      throw new Error("Only mechanics can create signoffs");
    }

    const now = Date.now();
    const signoffId = await ctx.db.insert("mechanicSignoffs", {
      ferryFlightId: args.ferryFlightId,
      mechanicUserId: args.mechanicUserId,
      statement: args.statement,
      limitations: args.limitations,
      signedAt: now,
      createdAt: now,
    });

    // Check if this is the first signoff for this flight
    const existingSignoffs = await ctx.db
      .query("mechanicSignoffs")
      .withIndex("by_flight", (q) =>
        q.eq("ferryFlightId", args.ferryFlightId)
      )
      .collect();

    if (existingSignoffs.length === 1) {
      // First signoff - update flight status
      await ctx.runMutation((api as any)["mutations/ferryFlights"].updateFerryFlightStatus, {
        id: args.ferryFlightId,
        status: "inspection_complete",
      });
    }

    return signoffId;
  },
});
