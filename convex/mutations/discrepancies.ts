import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createDiscrepancy = mutation({
  args: {
    ferryFlightId: v.id("ferryFlights"),
    description: v.string(),
    severity: v.union(
      v.literal("minor"),
      v.literal("major"),
      v.literal("critical")
    ),
    affectsFlight: v.boolean(),
    affectedSystem: v.optional(v.string()),
    createdBy: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("discrepancies", {
      ferryFlightId: args.ferryFlightId,
      description: args.description,
      severity: args.severity,
      affectsFlight: args.affectsFlight,
      affectedSystem: args.affectedSystem,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateDiscrepancy = mutation({
  args: {
    id: v.id("discrepancies"),
    description: v.optional(v.string()),
    severity: v.optional(
      v.union(
        v.literal("minor"),
        v.literal("major"),
        v.literal("critical")
      )
    ),
    affectsFlight: v.optional(v.boolean()),
    affectedSystem: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Discrepancy not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const deleteDiscrepancy = mutation({
  args: { id: v.id("discrepancies") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return true;
  },
});
