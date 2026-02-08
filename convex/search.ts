import { v } from "convex/values";
import { query } from "./_generated/server";

export const globalSearch = query({
  args: {
    q: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = args.q.trim().toLowerCase();
    const limit = Math.min(args.limit ?? 20, 50);
    if (!q) {
      return { documents: [], activity: [], tasks: [] };
    }

    const [documents, activity, tasks] = await Promise.all([
      ctx.db
        .query("documents")
        .withSearchIndex("search_text", (s) => s.search("searchText", q))
        .take(limit),
      ctx.db
        .query("activityEvents")
        .withSearchIndex("search_text", (s) => s.search("searchText", q))
        .take(limit),
      ctx.db
        .query("scheduledTasks")
        .withSearchIndex("search_text", (s) => s.search("searchText", q))
        .take(limit),
    ]);

    return { documents, activity, tasks };
  },
});
