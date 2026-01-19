import { query } from "../_generated/server";
import { v } from "convex/values";

export const getProfile = query({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getProfileByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getProfileBySupabaseUserId = query({
  args: { supabaseUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_supabase_user_id", (q) => q.eq("supabaseUserId", args.supabaseUserId))
      .first();
  },
});

// Get current user profile from Convex Auth identity
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Try to find profile by email
    if (identity.email) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first();
      
      if (profile) {
        return profile;
      }
    }

    // If no profile found, return null (profile will be created on first mutation)
    return null;
  },
});
