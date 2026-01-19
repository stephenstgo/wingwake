import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createPilotQualification = mutation({
  args: {
    pilotUserId: v.id("profiles"),
    certificateType: v.optional(v.string()),
    certificateNumber: v.optional(v.string()),
    ratings: v.optional(v.array(v.string())),
    medicalExpires: v.optional(v.number()),
    flightReviewExpires: v.optional(v.number()),
    bfrExpires: v.optional(v.number()),
    aircraftTypes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("pilotQualifications", {
      pilotUserId: args.pilotUserId,
      certificateType: args.certificateType,
      certificateNumber: args.certificateNumber,
      ratings: args.ratings,
      medicalExpires: args.medicalExpires,
      flightReviewExpires: args.flightReviewExpires,
      bfrExpires: args.bfrExpires,
      aircraftTypes: args.aircraftTypes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePilotQualification = mutation({
  args: {
    id: v.id("pilotQualifications"),
    certificateType: v.optional(v.string()),
    certificateNumber: v.optional(v.string()),
    ratings: v.optional(v.array(v.string())),
    medicalExpires: v.optional(v.number()),
    flightReviewExpires: v.optional(v.number()),
    bfrExpires: v.optional(v.number()),
    aircraftTypes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Pilot qualification not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});
