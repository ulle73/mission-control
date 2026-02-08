import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activityEvents: defineTable({
    ts: v.number(), // ms since epoch
    type: v.string(),
    title: v.string(),
    details: v.optional(v.string()),
    searchText: v.string(),
    status: v.union(v.literal("success"), v.literal("error"), v.literal("info")),
    tags: v.array(v.string()),
    source: v.union(v.literal("web"), v.literal("openclaw"), v.literal("system")),
    metadata: v.any(),
  })
    .index("by_ts", ["ts"])
    .searchIndex("search_text", {
      searchField: "searchText",
      filterFields: ["status", "type", "source"],
    }),

  scheduledTasks: defineTable({
    externalId: v.string(),
    name: v.string(),
    kind: v.union(v.literal("cron"), v.literal("at"), v.literal("every")),
    schedule: v.string(),
    tz: v.optional(v.string()),
    nextRunTs: v.number(),
    enabled: v.boolean(),
    payloadSummary: v.string(),
    searchText: v.string(),
  })
    .index("by_externalId", ["externalId"])
    .index("by_nextRunTs", ["nextRunTs"])
    .searchIndex("search_text", {
      searchField: "searchText",
      filterFields: ["enabled", "kind"],
    }),

  documents: defineTable({
    path: v.string(),
    title: v.string(),
    content: v.string(),
    searchText: v.string(),
    kind: v.union(v.literal("memory"), v.literal("note"), v.literal("doc")),
    updatedAt: v.number(),
  })
    .index("by_path", ["path"])
    .searchIndex("search_text", {
      searchField: "searchText",
      filterFields: ["kind"],
    }),
});
