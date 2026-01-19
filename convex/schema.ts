import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    supabaseUserId: v.optional(v.string()), // Store Supabase user ID for migration
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    role: v.union(
      v.literal("owner"),
      v.literal("mechanic"),
      v.literal("pilot"),
      v.literal("admin"),
      v.literal("viewer")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_supabase_user_id", ["supabaseUserId"]),

  organizations: defineTable({
    supabaseOrgId: v.optional(v.string()), // Store Supabase org ID for migration
    name: v.string(),
    type: v.union(
      v.literal("individual"),
      v.literal("llc"),
      v.literal("corporation"),
      v.literal("partnership")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_supabase_org_id", ["supabaseOrgId"]),

  organizationMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("profiles"),
    role: v.union(
      v.literal("owner"),
      v.literal("manager"),
      v.literal("member")
    ),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_organization_and_user", ["organizationId", "userId"]),

  aircraft: defineTable({
    supabaseAircraftId: v.optional(v.string()), // Store Supabase aircraft ID for migration
    nNumber: v.string(),
    manufacturer: v.optional(v.string()),
    model: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    year: v.optional(v.number()),
    baseLocation: v.optional(v.string()),
    ownerId: v.optional(v.id("organizations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_n_number", ["nNumber"])
    .index("by_owner", ["ownerId"])
    .index("by_supabase_aircraft_id", ["supabaseAircraftId"]),

  ferryFlights: defineTable({
    aircraftId: v.optional(v.id("aircraft")),
    tailNumber: v.optional(v.string()),
    ownerId: v.optional(v.id("organizations")),
    pilotUserId: v.optional(v.id("profiles")),
    mechanicUserId: v.optional(v.id("profiles")),
    origin: v.string(),
    destination: v.string(),
    purpose: v.optional(v.string()),
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
    plannedDeparture: v.optional(v.number()),
    actualDeparture: v.optional(v.number()),
    actualArrival: v.optional(v.number()),
    createdBy: v.optional(v.id("profiles")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_aircraft", ["aircraftId"])
    .index("by_created_by", ["createdBy"])
    .index("by_pilot", ["pilotUserId"])
    .index("by_mechanic", ["mechanicUserId"]),

  discrepancies: defineTable({
    ferryFlightId: v.id("ferryFlights"),
    description: v.string(),
    severity: v.union(
      v.literal("minor"),
      v.literal("major"),
      v.literal("critical")
    ),
    affectsFlight: v.boolean(),
    affectedSystem: v.optional(v.string()),
    createdBy: v.optional(v.id("profiles")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_flight", ["ferryFlightId"]),

  mechanicSignoffs: defineTable({
    ferryFlightId: v.id("ferryFlights"),
    mechanicUserId: v.id("profiles"),
    statement: v.string(),
    limitations: v.optional(v.string()),
    signedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_flight", ["ferryFlightId"])
    .index("by_mechanic", ["mechanicUserId"]),

  faaPermits: defineTable({
    ferryFlightId: v.id("ferryFlights"),
    status: v.union(
      v.literal("draft"),
      v.literal("submitted"),
      v.literal("approved"),
      v.literal("denied"),
      v.literal("expired")
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_flight", ["ferryFlightId"])
    .index("by_status", ["status"]),

  documents: defineTable({
    ferryFlightId: v.id("ferryFlights"),
    uploadedBy: v.optional(v.id("profiles")),
    fileName: v.string(),
    filePath: v.string(),
    fileSize: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("registration"),
        v.literal("airworthiness"),
        v.literal("logbook"),
        v.literal("permit"),
        v.literal("insurance"),
        v.literal("mechanic_statement"),
        v.literal("weight_balance"),
        v.literal("other")
      )
    ),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  })
    .index("by_flight", ["ferryFlightId"])
    .index("by_type", ["type"])
    .index("by_category", ["category"]),

  pilotQualifications: defineTable({
    pilotUserId: v.id("profiles"),
    certificateType: v.optional(v.string()),
    certificateNumber: v.optional(v.string()),
    ratings: v.optional(v.array(v.string())),
    medicalExpires: v.optional(v.number()),
    flightReviewExpires: v.optional(v.number()),
    bfrExpires: v.optional(v.number()),
    aircraftTypes: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_pilot", ["pilotUserId"]),

  insurancePolicies: defineTable({
    organizationId: v.id("organizations"),
    aircraftId: v.optional(v.id("aircraft")),
    provider: v.string(),
    policyNumber: v.string(),
    coverageLimits: v.optional(v.string()),
    coversFerryFlights: v.boolean(),
    effectiveDate: v.number(),
    expirationDate: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_aircraft", ["aircraftId"]),

  auditLogs: defineTable({
    ferryFlightId: v.optional(v.id("ferryFlights")),
    userId: v.optional(v.id("profiles")),
    action: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    changes: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_flight", ["ferryFlightId"])
    .index("by_user", ["userId"])
    .index("by_action", ["action"]),
});
