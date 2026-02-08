"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Success", value: "success" },
  { label: "Error", value: "error" },
  { label: "Info", value: "info" },
] as const;

type StatusFilter = "" | "info" | "success" | "error";

export default function ActivityPage() {
  const [status, setStatus] = useState<StatusFilter>("");
  const [type, setType] = useState("");
  const [tag, setTag] = useState("");

  const args = useMemo(
    () => ({
      status: status || undefined,
      type: type || undefined,
      tag: tag || undefined,
    }),
    [status, type, tag]
  );

  const { results, status: qStatus, loadMore, isLoading } = usePaginatedQuery(
    api.activity.listEvents,
    args,
    { initialNumItems: 25 }
  );

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          qStatus === "CanLoadMore" &&
          !isLoading
        ) {
          loadMore(25);
        }
      },
      { threshold: 0.1 }
    );

    const el = observerTarget.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [qStatus, isLoading, loadMore]);

  const clearFilters = () => {
    setStatus("");
    setType("");
    setTag("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Activity
          </h1>
          <div className="mt-1 text-xs text-white/50">
            Live log of actions and completed tasks.
          </div>
        </div>
        <Badge tone="neutral">{qStatus}</Badge>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              Status
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value as StatusFilter)}
                    className={
                      "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black " +
                      (active
                        ? "bg-white/[0.10] text-white border-white/20"
                        : "bg-white/[0.03] text-white/70 border-white/10 hover:bg-white/[0.06] hover:text-white")
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-1 min-w-[240px] gap-3">
            <label className="flex-1 space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                Type
              </div>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-[color:var(--accent)]/40"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g. task.run"
              />
            </label>
            <label className="flex-1 space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                Tag
              </div>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-[color:var(--accent)]/40"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. convex"
              />
            </label>
          </div>

          {(status || type || tag) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-3">
        {results?.map((e) => {
          const tone: "success" | "error" | "info" =
            e.status === "success"
              ? "success"
              : e.status === "error"
                ? "error"
                : "info";
          return (
            <Card key={e._id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge tone={tone}>{e.status}</Badge>
                    <div className="truncate text-sm font-semibold text-white">
                      {e.title}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
                    <span className="text-white/70">
                      {new Date(e.ts).toLocaleString()}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono">
                      {e.type}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="capitalize">{e.source}</span>
                  </div>

                  {e.details ? (
                    <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-3 text-[11px] leading-relaxed text-white/70">
                      {e.details}
                    </pre>
                  ) : null}

                  {e.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {e.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold text-white/60"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}

        {isLoading ? (
          <div className="py-4 text-center text-xs text-white/40">
            Loading more…
          </div>
        ) : null}

        <div ref={observerTarget} className="h-6" />

        {!results?.length && !isLoading ? (
          <Card className="p-10 text-center">
            <div className="text-sm font-semibold text-white">
              No activity found
            </div>
            <p className="mt-1 text-xs text-white/55">
              Try adjusting your filters.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
