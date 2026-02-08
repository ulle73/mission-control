import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const logEvent = mutation({
  args: {
    ts: v.optional(v.number()),
    type: v.string(),
    title: v.string(),
    details: v.optional(v.string()),
    status: v.union(v.literal("success"), v.literal("error"), v.literal("info")),
    tags: v.optional(v.array(v.string())),
    source: v.union(v.literal("web"), v.literal("openclaw"), v.literal("system")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const ts = args.ts ?? Date.now();
    const tags = args.tags ?? [];
    const details = args.details;
    const searchText = [args.type, args.title, details ?? "", tags.join(" ")]
      .join(" \n")
      .toLowerCase();

    const id = await ctx.db.insert("activityEvents", {
      ts,
      type: args.type,
      title: args.title,
      details,
      searchText,
      status: args.status,
      tags,
      source: args.source,
      metadata: args.metadata ?? null,
    });
    return id;
  },
});

export const listEvents = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.union(v.literal("success"), v.literal("error"), v.literal("info"))),
    type: v.optional(v.string()),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const q = ctx.db.query("activityEvents").withIndex("by_ts");

    // Convex doesn't support ad-hoc filtering inside the index easily, so we filter post-query.
    // Pagination is still handled by the underlying ordered index.
    const page = await q.order("desc").paginate(args.paginationOpts);

    const filtered = page.page.filter((e) => {
      if (args.status && e.status !== args.status) return false;
      if (args.type && e.type !== args.type) return false;
      if (args.tag && !e.tags.includes(args.tag)) return false;
      return true;
    });

    return { ...page, page: filtered };
  },
});
