import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createOrganization = mutation({
  args: {
    supabaseOrgId: v.optional(v.string()),
    name: v.string(),
    type: v.union(
      v.literal("individual"),
      v.literal("llc"),
      v.literal("corporation"),
      v.literal("partnership")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("organizations", {
      supabaseOrgId: args.supabaseOrgId,
      name: args.name,
      type: args.type,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateOrganization = mutation({
  args: {
    id: v.id("organizations"),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("individual"),
        v.literal("llc"),
        v.literal("corporation"),
        v.literal("partnership")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Organization not found");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const addMemberToOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("profiles"),
    role: v.union(
      v.literal("owner"),
      v.literal("manager"),
      v.literal("member")
    ),
  },
  handler: async (ctx, args) => {
    // Check if member already exists
    const existing = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("organizationMembers", {
      organizationId: args.organizationId,
      userId: args.userId,
      role: args.role,
      createdAt: Date.now(),
    });
  },
});

export const removeMemberFromOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("profiles"),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization_and_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", args.userId)
      )
      .first();

    if (member) {
      await ctx.db.delete(member._id);
      return true;
    }

    return false;
  },
});
