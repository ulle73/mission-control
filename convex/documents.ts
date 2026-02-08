import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const upsertDocument = mutation({
  args: {
    path: v.string(),
    title: v.string(),
    content: v.string(),
    kind: v.union(v.literal("memory"), v.literal("note"), v.literal("doc")),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_path", (q) => q.eq("path", args.path))
      .unique();

    const searchText = [args.path, args.title, args.content].join("\n").toLowerCase();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        content: args.content,
        kind: args.kind,
        updatedAt: args.updatedAt,
        searchText,
      });
      return existing._id;
    }

    return await ctx.db.insert("documents", { ...args, searchText });
  },
});
