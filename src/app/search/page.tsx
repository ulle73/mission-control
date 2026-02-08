"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(timer);
  }, [q]);

  const args = useMemo(() => ({ q: debouncedQ, limit: 20 }), [debouncedQ]);

  type SearchRes = {
    documents: { _id: string; title: string; path: string; content?: string }[];
    activity: {
      _id: string;
      title: string;
      details?: string;
      type: string;
      status: string;
      ts: number;
    }[];
    tasks: {
      _id: string;
      name: string;
      payloadSummary?: string;
      kind: string;
      enabled: boolean;
      nextRunTs: number;
    }[];
  };

  const res = useQuery(api.search.globalSearch, args) as SearchRes | undefined;

  const hasResults =
    !!res &&
    (res.documents.length > 0 || res.activity.length > 0 || res.tasks.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Search
        </h1>
        <div className="mt-1 text-xs text-white/50">
          Search memories, documents, activity and scheduled tasks.
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-white/20 focus:ring-2 focus:ring-[color:var(--accent)]/40"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type to search everything…"
            autoFocus
          />
          {q !== debouncedQ ? (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
            </div>
          ) : null}
        </div>
      </Card>

      {!debouncedQ.trim() ? (
        <Card className="p-10 text-center">
          <div className="text-sm font-semibold text-white">Start typing</div>
          <div className="mt-1 text-xs text-white/55">
            Results will appear instantly.
          </div>
        </Card>
      ) : !res ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="mc-shimmer h-24 rounded-2xl border border-white/10" />
          ))}
        </div>
      ) : !hasResults ? (
        <Card className="p-10 text-center">
          <div className="text-sm font-semibold text-white">
            No results
          </div>
          <div className="mt-1 text-xs text-white/55">
            Try different keywords.
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {res.documents.length > 0 && (
            <Section title="Documents" icon="📄" count={res.documents.length}>
              {res.documents.map((d) => (
                <ResultCard
                  key={d._id}
                  title={d.title}
                  subtitle={d.path}
                  body={(d.content ?? "").slice(0, 280)}
                />
              ))}
            </Section>
          )}

          {res.activity.length > 0 && (
            <Section title="Activity" icon="⚡" count={res.activity.length}>
              {res.activity.map((e) => (
                <ResultCard
                  key={e._id}
                  title={e.title}
                  subtitle={`${e.type} • ${e.status} • ${new Date(e.ts).toLocaleString()}`}
                  body={(e.details ?? "").slice(0, 280)}
                />
              ))}
            </Section>
          )}

          {res.tasks.length > 0 && (
            <Section title="Scheduled Tasks" icon="📅" count={res.tasks.length}>
              {res.tasks.map((t) => (
                <ResultCard
                  key={t._id}
                  title={t.name}
                  subtitle={`${t.kind} • ${t.enabled ? "enabled" : "disabled"} • ${new Date(
                    t.nextRunTs
                  ).toLocaleString()}`}
                  body={(t.payloadSummary ?? "").slice(0, 280)}
                />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h2 className="text-sm font-semibold tracking-tight text-white">
            {title}
          </h2>
        </div>
        <Badge tone="neutral">{count}</Badge>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

function ResultCard({
  title,
  subtitle,
  body,
}: {
  title: string;
  subtitle?: string;
  body?: string;
}) {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold text-white">{title}</div>
      {subtitle ? (
        <div className="mt-1 text-[11px] text-white/55">{subtitle}</div>
      ) : null}
      {body ? (
        <div className="mt-3 line-clamp-3 text-xs leading-relaxed text-white/70">
          {body}
        </div>
      ) : null}
    </Card>
  );
}
