import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { auth } from "../auth";

export const createProfile = mutation({
  args: {
    supabaseUserId: v.optional(v.string()),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    role: v.union(
      v.literal("owner"),
      v.literal("mechanic"),
      v.literal("pilot"),
      v.literal("admin"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("profiles", {
      supabaseUserId: args.supabaseUserId,
      email: args.email,
      fullName: args.fullName,
      role: args.role,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Sync Convex Auth user with profile
export const syncAuthProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return null instead of throwing - allows retry without breaking the flow
      // This can happen if called before auth token is fully propagated
      return null;
    }

    // Check if profile already exists by email
    if (identity.email) {
      const existing = await ctx.db
        .query("profiles")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first();

      if (existing) {
        return existing._id;
      }
    }

    // Create new profile from auth identity
    const now = Date.now();
    return await ctx.db.insert("profiles", {
      email: identity.email,
      fullName: identity.name,
      role: "viewer", // Default role
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProfile = mutation({
  args: {
    id: v.id("profiles"),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("owner"),
        v.literal("mechanic"),
        v.literal("pilot"),
        v.literal("admin"),
        v.literal("viewer")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Profile not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});
