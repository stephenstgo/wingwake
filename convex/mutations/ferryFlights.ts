import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createFerryFlight = mutation({
  args: {
    aircraftId: v.optional(v.id("aircraft")),
    tailNumber: v.optional(v.string()),
    ownerId: v.optional(v.id("organizations")),
    pilotUserId: v.optional(v.id("profiles")),
    mechanicUserId: v.optional(v.id("profiles")),
    origin: v.string(),
    destination: v.string(),
    purpose: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("inspection_pending"),
        v.literal("inspection_complete"),
        v.literal("faa_submitted"),
        v.literal("faa_questions"),
        v.literal("permit_issued"),
        v.literal("scheduled"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("aborted"),
        v.literal("denied")
      )
    ),
    plannedDeparture: v.optional(v.number()),
    actualDeparture: v.optional(v.number()),
    actualArrival: v.optional(v.number()),
    createdBy: v.id("profiles"),
    createdAt: v.optional(v.number()), // For migration - preserve original timestamp
    updatedAt: v.optional(v.number()), // For migration - preserve original timestamp
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const flightId = await ctx.db.insert("ferryFlights", {
      aircraftId: args.aircraftId,
      tailNumber: args.tailNumber,
      ownerId: args.ownerId,
      pilotUserId: args.pilotUserId,
      mechanicUserId: args.mechanicUserId,
      origin: args.origin,
      destination: args.destination,
      purpose: args.purpose,
      status: args.status || "draft",
      plannedDeparture: args.plannedDeparture,
      actualDeparture: args.actualDeparture,
      actualArrival: args.actualArrival,
      createdBy: args.createdBy,
      createdAt: args.createdAt || now,
      updatedAt: args.updatedAt || now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      ferryFlightId: flightId,
      userId: args.createdBy,
      action: "flight_created",
      entityType: "ferry_flight",
      entityId: flightId,
      createdAt: now,
    });

    return flightId;
  },
});

export const updateFerryFlight = mutation({
  args: {
    id: v.id("ferryFlights"),
    aircraftId: v.optional(v.id("aircraft")),
    tailNumber: v.optional(v.string()),
    ownerId: v.optional(v.id("organizations")),
    pilotUserId: v.optional(v.id("profiles")),
    mechanicUserId: v.optional(v.id("profiles")),
    origin: v.optional(v.string()),
    destination: v.optional(v.string()),
    purpose: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("inspection_pending"),
        v.literal("inspection_complete"),
        v.literal("faa_submitted"),
        v.literal("faa_questions"),
        v.literal("permit_issued"),
        v.literal("scheduled"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("aborted"),
        v.literal("denied")
      )
    ),
    plannedDeparture: v.optional(v.number()),
    actualDeparture: v.optional(v.number()),
    actualArrival: v.optional(v.number()),
    userId: v.optional(v.id("profiles")),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Ferry flight not found");
    }

    const changes: Record<string, any> = {};
    let statusChanged = false;

    // Track changes
    Object.keys(updates).forEach((key) => {
      if (updates[key as keyof typeof updates] !== undefined) {
        const oldValue = existing[key as keyof typeof existing];
        const newValue = updates[key as keyof typeof updates];
        if (oldValue !== newValue) {
          changes[key] = { from: oldValue, to: newValue };
          if (key === "status") {
            statusChanged = true;
          }
        }
      }
    });

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    // Create audit log
    if (Object.keys(changes).length > 0 && userId) {
      await ctx.db.insert("auditLogs", {
        ferryFlightId: id,
        userId,
        action: statusChanged ? "status_changed" : "flight_updated",
        entityType: "ferry_flight",
        entityId: id,
        changes,
        createdAt: Date.now(),
      });
    }

    return id;
  },
});

export const updateFerryFlightStatus = mutation({
  args: {
    id: v.id("ferryFlights"),
    status: v.union(
      v.literal("draft"),
      v.literal("inspection_pending"),
      v.literal("inspection_complete"),
      v.literal("faa_submitted"),
      v.literal("faa_questions"),
      v.literal("permit_issued"),
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("aborted"),
      v.literal("denied")
    ),
    userId: v.optional(v.id("profiles")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Ferry flight not found");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Create audit log
    if (args.userId) {
      await ctx.db.insert("auditLogs", {
        ferryFlightId: args.id,
        userId: args.userId,
        action: "status_changed",
        entityType: "ferry_flight",
        entityId: args.id,
        changes: {
          status: { from: existing.status, to: args.status },
        },
        createdAt: Date.now(),
      });
    }

    return args.id;
  },
});

export const deleteFerryFlight = mutation({
  args: { id: v.id("ferryFlights") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return true;
  },
});
