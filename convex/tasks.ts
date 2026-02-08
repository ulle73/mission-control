import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const kindValidator = v.union(v.literal("cron"), v.literal("at"), v.literal("every"));

export const upsertScheduledTask = mutation({
  args: {
    externalId: v.string(),
    name: v.string(),
    kind: kindValidator,
    schedule: v.string(),
    tz: v.optional(v.string()),
    nextRunTs: v.number(),
    enabled: v.boolean(),
    payloadSummary: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .unique();

    const searchText = [args.externalId, args.name, args.kind, args.schedule, args.payloadSummary]
      .join(" \n")
      .toLowerCase();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        searchText,
      });
      return existing._id;
    }

    return await ctx.db.insert("scheduledTasks", { ...args, searchText });
  },
});

export const updateScheduledTask = mutation({
  args: {
    id: v.id("scheduledTasks"),
    name: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    nextRunTs: v.optional(v.number()),
    payloadSummary: v.optional(v.string()),
    schedule: v.optional(v.string()),
    tz: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Task not found");

    const next = {
      name: args.name ?? current.name,
      enabled: args.enabled ?? current.enabled,
      nextRunTs: args.nextRunTs ?? current.nextRunTs,
      payloadSummary: args.payloadSummary ?? current.payloadSummary,
      schedule: args.schedule ?? current.schedule,
      tz: args.tz ?? current.tz,
    };

    const searchText = [
      current.externalId,
      next.name,
      current.kind,
      next.schedule,
      next.payloadSummary,
    ]
      .join(" \n")
      .toLowerCase();

    await ctx.db.patch(args.id, { ...next, searchText });
    return args.id;
  },
});

export const tasksInRange = query({
  args: { startTs: v.number(), endTs: v.number() },
  handler: async (ctx, args) => {
    // Fetch by nextRunTs index and filter in-range.
    const tasks = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_nextRunTs", (q) => q.gte("nextRunTs", args.startTs).lte("nextRunTs", args.endTs))
      .order("asc")
      .collect();
    return tasks;
  },
});
