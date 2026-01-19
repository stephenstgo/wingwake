import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createAuditLog = mutation({
  args: {
    ferryFlightId: v.optional(v.id("ferryFlights")),
    userId: v.optional(v.id("profiles")),
    action: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    changes: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      ferryFlightId: args.ferryFlightId,
      userId: args.userId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      changes: args.changes,
      createdAt: Date.now(),
    });
  },
});
