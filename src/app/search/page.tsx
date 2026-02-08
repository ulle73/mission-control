"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const args = useMemo(() => ({ q: debouncedQ, limit: 20 }), [debouncedQ]);
  type SearchRes = {
    documents: { _id: string; title: string; path: string; content?: string }[];
    activity: { _id: string; title: string; details?: string; type: string; status: string; ts: number }[];
    tasks: { _id: string; name: string; payloadSummary?: string; kind: string; enabled: boolean; nextRunTs: number }[];
  };

  const res = useQuery(api.search.globalSearch, args) as SearchRes | undefined;

  const hasResults = res && (res.documents.length > 0 || res.activity.length > 0 || res.tasks.length > 0);

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Search</h1>
        <p className="text-sm text-gray-500">Search across documents, activity logs, and scheduled tasks.</p>
      </div>

      <div className="relative">
        <input
          className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-lg shadow-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-100"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type to search everything..."
          autoFocus
        />
        {q !== debouncedQ && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
             <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
          </div>
        )}
      </div>

      {!debouncedQ.trim() ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl">🔍</div>
          <div className="mt-4 text-lg font-medium text-gray-900">Start typing to search</div>
          <p className="mt-1 text-sm text-gray-500">Quickly find whatever you&apos;re looking for.</p>
        </div>
      ) : !res ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="h-24 rounded-lg bg-gray-50" />
            </div>
          ))}
        </div>
      ) : !hasResults ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-4xl">🤷‍♂️</div>
          <div className="mt-4 text-lg font-medium text-gray-900">No results for &quot;{debouncedQ}&quot;</div>
          <p className="mt-1 text-sm text-gray-500">Try using different keywords or checking your spelling.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {res.documents.length > 0 && (
            <Section title="Documents" icon="📄" count={res.documents.length}>
              {res.documents.map((d) => (
                <ResultCard
                  key={d._id}
                  title={d.title}
                  subtitle={d.path}
                  body={(d.content ?? "").slice(0, 300)}
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
                  body={(e.details ?? "").slice(0, 300)}
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
                  body={(t.payloadSummary ?? "").slice(0, 300)}
                />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, count, children }: { title: string; icon: string; count: number; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">{title}</h2>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">{count}</span>
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
    <div className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-gray-200 hover:shadow-md">
      <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</div>
      {subtitle ? <div className="mt-1 text-[11px] font-medium text-gray-500">{subtitle}</div> : null}
      {body ? (
        <div className="mt-3 line-clamp-3 text-xs leading-relaxed text-gray-600">
          {body}
        </div>
      ) : null}
    </div>
  );
}
