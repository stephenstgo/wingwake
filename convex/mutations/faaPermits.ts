import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const createPermit = mutation({
  args: {
    ferryFlightId: v.id("ferryFlights"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("submitted"),
        v.literal("approved"),
        v.literal("denied"),
        v.literal("expired")
      )
    ),
    submittedAt: v.optional(v.number()),
    submittedVia: v.optional(v.string()),
    fsdoMido: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    permitNumber: v.optional(v.string()),
    limitations: v.optional(v.any()),
    limitationsText: v.optional(v.string()),
    faaContactName: v.optional(v.string()),
    faaContactEmail: v.optional(v.string()),
    faaQuestions: v.optional(v.string()),
    faaResponses: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("faaPermits", {
      ferryFlightId: args.ferryFlightId,
      status: args.status || "draft",
      submittedAt: args.submittedAt,
      submittedVia: args.submittedVia,
      fsdoMido: args.fsdoMido,
      approvedAt: args.approvedAt,
      expiresAt: args.expiresAt,
      permitNumber: args.permitNumber,
      limitations: args.limitations,
      limitationsText: args.limitationsText,
      faaContactName: args.faaContactName,
      faaContactEmail: args.faaContactEmail,
      faaQuestions: args.faaQuestions,
      faaResponses: args.faaResponses,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePermit = mutation({
  args: {
    id: v.id("faaPermits"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("submitted"),
        v.literal("approved"),
        v.literal("denied"),
        v.literal("expired")
      )
    ),
    submittedAt: v.optional(v.number()),
    submittedVia: v.optional(v.string()),
    fsdoMido: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    permitNumber: v.optional(v.string()),
    limitations: v.optional(v.any()),
    limitationsText: v.optional(v.string()),
    faaContactName: v.optional(v.string()),
    faaContactEmail: v.optional(v.string()),
    faaQuestions: v.optional(v.string()),
    faaResponses: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Permit not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const submitPermit = mutation({
  args: {
    permitId: v.id("faaPermits"),
    submittedVia: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    return await ctx.runMutation((api as any)["mutations/faaPermits"].updatePermit, {
      id: args.permitId,
      status: "submitted",
      submittedAt: Date.now(),
      submittedVia: args.submittedVia,
    });
  },
});

export const approvePermit = mutation({
  args: {
    permitId: v.id("faaPermits"),
    permitNumber: v.string(),
    expiresAt: v.number(),
    limitations: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    return await ctx.runMutation((api as any)["mutations/faaPermits"].updatePermit, {
      id: args.permitId,
      status: "approved",
      approvedAt: Date.now(),
      permitNumber: args.permitNumber,
      expiresAt: args.expiresAt,
      limitationsText: args.limitations,
    });
  },
});

export const denyPermit = mutation({
  args: { permitId: v.id("faaPermits") },
  handler: async (ctx, args): Promise<string> => {
    return await ctx.runMutation((api as any)["mutations/faaPermits"].updatePermit, {
      id: args.permitId,
      status: "denied",
    });
  },
});
