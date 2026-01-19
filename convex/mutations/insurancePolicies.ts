import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createInsurancePolicy = mutation({
  args: {
    organizationId: v.id("organizations"),
    aircraftId: v.optional(v.id("aircraft")),
    provider: v.string(),
    policyNumber: v.string(),
    coverageLimits: v.optional(v.string()),
    coversFerryFlights: v.boolean(),
    effectiveDate: v.number(),
    expirationDate: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("insurancePolicies", {
      organizationId: args.organizationId,
      aircraftId: args.aircraftId,
      provider: args.provider,
      policyNumber: args.policyNumber,
      coverageLimits: args.coverageLimits,
      coversFerryFlights: args.coversFerryFlights,
      effectiveDate: args.effectiveDate,
      expirationDate: args.expirationDate,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateInsurancePolicy = mutation({
  args: {
    id: v.id("insurancePolicies"),
    provider: v.optional(v.string()),
    policyNumber: v.optional(v.string()),
    coverageLimits: v.optional(v.string()),
    coversFerryFlights: v.optional(v.boolean()),
    effectiveDate: v.optional(v.number()),
    expirationDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Insurance policy not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});
