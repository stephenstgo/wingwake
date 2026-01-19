import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createDocument = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      ferryFlightId: args.ferryFlightId,
      uploadedBy: args.uploadedBy,
      fileName: args.fileName,
      filePath: args.filePath,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      type: args.type,
      category: args.category,
      description: args.description,
      storageId: args.storageId,
      createdAt: Date.now(),
    });
  },
});

export const deleteDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (doc && doc.storageId) {
      // Delete from storage if it exists
      await ctx.storage.delete(doc.storageId);
    }
    await ctx.db.delete(args.id);
    return true;
  },
});
