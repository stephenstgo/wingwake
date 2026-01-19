import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createAircraft = mutation({
  args: {
    supabaseAircraftId: v.optional(v.string()),
    nNumber: v.string(),
    manufacturer: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    year: v.optional(v.number()),
    baseLocation: v.optional(v.string()),
    ownerId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    // Check if n_number already exists
    const existing = await ctx.db
      .query("aircraft")
      .withIndex("by_n_number", (q) => q.eq("nNumber", args.nNumber))
      .first();

    if (existing) {
      throw new Error("Aircraft with this N-number already exists");
    }

    const now = Date.now();
    return await ctx.db.insert("aircraft", {
      supabaseAircraftId: args.supabaseAircraftId,
      nNumber: args.nNumber,
      manufacturer: args.manufacturer,
      model: args.model,
      serialNumber: args.serialNumber,
      year: args.year,
      baseLocation: args.baseLocation,
      ownerId: args.ownerId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateAircraft = mutation({
  args: {
    id: v.id("aircraft"),
    nNumber: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    year: v.optional(v.number()),
    baseLocation: v.optional(v.string()),
    ownerId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Aircraft not found");
    }

    // If nNumber is being updated, check for duplicates
    if (updates.nNumber && updates.nNumber !== existing.nNumber) {
      const duplicate = await ctx.db
        .query("aircraft")
        .withIndex("by_n_number", (q) => q.eq("nNumber", updates.nNumber!))
        .first();

      if (duplicate) {
        throw new Error("Aircraft with this N-number already exists");
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const deleteAircraft = mutation({
  args: { id: v.id("aircraft") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return true;
  },
});
