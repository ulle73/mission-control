"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  addDays,
  addWeeks,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
  subWeeks,
} from "date-fns";

function dayKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

const KIND_COLORS: Record<string, string> = {
  cron: "bg-blue-50 border-blue-200 text-blue-700",
  at: "bg-purple-50 border-purple-200 text-purple-700",
  every: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

export default function CalendarPage() {
  const [anchor, setAnchor] = useState(() => new Date());

  const weekStart = useMemo(
    () => startOfWeek(anchor, { weekStartsOn: 1 }),
    [anchor]
  );
  const weekEnd = useMemo(
    () => endOfWeek(anchor, { weekStartsOn: 1 }),
    [anchor]
  );

  const startTs = weekStart.getTime();
  const endTs = weekEnd.getTime();

  const tasksQuery = useQuery(api.tasks.tasksInRange, { startTs, endTs });
  const tasks = useMemo(() => tasksQuery ?? [], [tasksQuery]);

  const byDay = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const t of tasks) {
      const k = dayKey(new Date(t.nextRunTs));
      map.set(k, [...(map.get(k) ?? []), t]);
    }
    return map;
  }, [tasks]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = tasks.find((t) => t._id === selectedId) ?? null;

  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Calendar</h1>
          <div className="mt-1 text-sm font-medium text-gray-500">
            {format(weekStart, "MMMM d")} – {format(weekEnd, "MMMM d, yyyy")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-gray-200 bg-white p-1">
            <button
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              onClick={() => setAnchor((d) => subWeeks(d, 1))}
            >
              Prev
            </button>
            <button
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              onClick={() => setAnchor(new Date())}
            >
              Today
            </button>
            <button
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              onClick={() => setAnchor((d) => addWeeks(d, 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Weekly Highlights</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {tasks.slice(0, 4).map(t => (
            <button
              key={t._id}
              onClick={() => setSelectedId(t._id)}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2.5 text-left transition-shadow hover:shadow-sm"
            >
              <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${KIND_COLORS[t.kind] || 'bg-gray-50'}`}>
                <span className="text-[10px] font-bold uppercase">{t.kind[0]}</span>
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-gray-900">{t.name}</div>
                <div className="text-[10px] text-gray-500">{format(new Date(t.nextRunTs), "EEE, HH:mm")}</div>
              </div>
            </button>
          ))}
          {tasks.length === 0 && (
            <div className="col-span-full py-2 text-center text-xs text-gray-400">No tasks scheduled this week.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-8 border-b border-gray-100 bg-gray-50/50">
            <div className="p-3" />
            {days.map((d) => {
              const isToday = isSameDay(d, today);
              return (
                <div key={dayKey(d)} className={`p-3 text-center border-l border-gray-100 ${isToday ? 'bg-blue-50/50' : ''}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                    {format(d, "EEE")}
                  </div>
                  <div className={`mt-1 text-sm font-semibold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                    {format(d, "d")}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-8 relative h-[600px] overflow-y-auto">
            {/* time column */}
            <div className="border-r border-gray-100 bg-gray-50/30 sticky left-0 z-10">
              {Array.from({ length: 24 }).map((_, h) => (
                <div
                  key={h}
                  className="h-[60px] border-b border-gray-100 px-2 py-1 text-[10px] font-medium text-gray-400"
                >
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {days.map((d) => {
              const k = dayKey(d);
              const dayTasks = byDay.get(k) ?? [];
              const isToday = isSameDay(d, today);
              return (
                <div key={k} className={`relative border-r border-gray-100 last:border-r-0 ${isToday ? 'bg-blue-50/10' : ''}`}>
                  {Array.from({ length: 24 }).map((_, h) => (
                    <div key={h} className="h-[60px] border-b border-gray-50/50" />
                  ))}

                  {/* tasks */}
                  {dayTasks.map((t) => {
                    const dt = new Date(t.nextRunTs);
                    const minutes = dt.getHours() * 60 + dt.getMinutes();
                    const top = minutes; // 1px = 1 minute
                    return (
                      <button
                        key={t._id}
                        onClick={() => setSelectedId(t._id)}
                        className={`absolute left-1 right-1 rounded-md border px-2 py-1 text-left shadow-sm transition-all hover:scale-[1.02] hover:z-20 ${
                          t.enabled ? (KIND_COLORS[t.kind] || "bg-white border-gray-200") : "bg-gray-100 border-gray-200 text-gray-400 opacity-60"
                        }`}
                        style={{ top, height: 32 }}
                        title={t.payloadSummary}
                      >
                        <div className="truncate text-[10px] font-bold leading-tight">{t.name}</div>
                        <div className="truncate text-[9px] opacity-80 font-medium">
                          {format(dt, "HH:mm")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sticky top-6">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">Task Details</h3>
            {!selected ? (
              <div className="mt-8 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 text-2xl">
                  📅
                </div>
                <div className="mt-3 text-xs font-medium text-gray-400">Select a task to view its properties</div>
              </div>
            ) : (
              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Name</div>
                  <div className="mt-1 font-semibold text-gray-900">{selected.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Kind</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${selected.kind === 'cron' ? 'bg-blue-500' : selected.kind === 'at' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                      <span className="font-medium capitalize">{selected.kind}</span>
                    </div>

                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</div>
                    <div className="mt-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${selected.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {selected.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Next Run</div>
                  <div className="mt-1 font-medium text-gray-700">{format(new Date(selected.nextRunTs), "PPpp")}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Schedule</div>
                  <div className="mt-1.5 rounded-md bg-gray-50 p-2 font-mono text-[10px] text-gray-600 border border-gray-100">
                    {selected.schedule}
                    {selected.tz && <span className="ml-2 opacity-50">({selected.tz})</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Payload</div>
                  <pre className="mt-1.5 whitespace-pre-wrap rounded-md bg-gray-50 p-2 text-[10px] leading-relaxed text-gray-600 border border-gray-100">
                    {selected.payloadSummary || "No payload summary"}
                  </pre>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">External ID</div>
                  <div className="mt-1 font-mono text-[9px] text-gray-400 break-all">{selected.externalId}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
