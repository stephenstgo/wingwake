import { query } from "../_generated/server";
import { v } from "convex/values";

export const getOrganization = query({
  args: { id: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getOrganizationBySupabaseId = query({
  args: { supabaseOrgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_supabase_org_id", (q) => q.eq("supabaseOrgId", args.supabaseOrgId))
      .first();
  },
});

export const getUserOrganizations = query({
  args: { userId: v.id("profiles") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const orgIds = members.map((m) => m.organizationId);
    const organizations = await Promise.all(
      orgIds.map((id) => ctx.db.get(id))
    );
    return organizations.filter((org) => org !== null);
  },
});

export const getOrganizationMembers = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();
  },
});
