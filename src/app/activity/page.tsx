"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Success", value: "success" },
  { label: "Error", value: "error" },
  { label: "Info", value: "info" },
] as const;

export default function ActivityPage() {
  const [status, setStatus] = useState<"" | "info" | "success" | "error">("");
  const [type, setType] = useState("");
  const [tag, setTag] = useState("");

  const args = useMemo(() => {
    return {
      status: status || undefined,
      type: type || undefined,
      tag: tag || undefined,
    };
  }, [status, type, tag]);

  const { results, status: qStatus, loadMore, isLoading } = usePaginatedQuery(
    api.activity.listEvents,
    args,
    { initialNumItems: 25 }
  );

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && qStatus === "CanLoadMore" && !isLoading) {
          loadMore(25);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
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
        <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
        <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
          {qStatus}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</span>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    status === opt.value
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-1 min-w-[200px] gap-2">
            <div className="flex-1 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Type</span>
              <input
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs focus:border-gray-900 focus:outline-none"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g. task.run"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tag</span>
              <input
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs focus:border-gray-900 focus:outline-none"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. convex"
              />
            </div>
          </div>

          {(status || type || tag) && (
            <button
              onClick={clearFilters}
              className="mb-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {results?.map((e) => (
          <div key={e._id} className="group relative rounded-lg border border-gray-100 bg-white p-3 transition-shadow hover:shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    e.status === "success" ? "bg-green-500" :
                    e.status === "error" ? "bg-red-500" : "bg-blue-500"
                  }`} />
                  <div className="truncate text-sm font-semibold text-gray-900">{e.title}</div>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-500">
                  <span className="font-medium text-gray-700">{new Date(e.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>•</span>
                  <span className="rounded-md bg-gray-50 px-1.5 py-0.5">{e.type}</span>
                  <span>•</span>
                  <span className="capitalize">{e.source}</span>
                </div>
                {e.details ? (
                  <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-2 text-[11px] leading-relaxed text-gray-600">
                    {e.details}
                  </pre>
                ) : null}
                {e.tags?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {e.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-gray-100 bg-white px-1.5 py-0.5 text-[9px] font-medium text-gray-500"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="py-4 text-center text-xs text-gray-400">Loading more...</div>
        )}

        <div ref={observerTarget} className="h-4" />

        {!results?.length && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-sm font-medium text-gray-900">No activity found</div>
            <p className="text-xs text-gray-500">Try adjusting your filters.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
