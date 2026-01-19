"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

export const getUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const uploadDocument = action({
  args: {
    ferryFlightId: v.id("ferryFlights"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
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
    storageId: v.id("_storage"),
    uploadedBy: v.optional(v.id("profiles")),
  },
  handler: async (ctx, args): Promise<string> => {
    const timestamp = Date.now();
    const filePath = `${args.ferryFlightId}/${timestamp}_${args.fileName}`;

    const documentId: string = await ctx.runMutation((api as any)["mutations/documents"].createDocument, {
      ferryFlightId: args.ferryFlightId,
      uploadedBy: args.uploadedBy,
      fileName: args.fileName,
      filePath,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      type: args.type,
      category: args.category,
      description: args.description,
      storageId: args.storageId,
    });

    return documentId;
  },
});

export const getDocumentDownloadUrl = action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args): Promise<string | null> => {
    const doc = await ctx.runQuery((api as any)["queries/documents"].getDocument, {
      id: args.documentId,
    });

    if (!doc || !doc.storageId) {
      return null;
    }

    return await ctx.storage.getUrl(doc.storageId);
  },
});
