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
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";

function dayKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

const KIND_COLORS: Record<string, string> = {
  cron: "bg-sky-500/15 border-sky-400/20 text-sky-200",
  at: "bg-fuchsia-500/15 border-fuchsia-400/20 text-fuchsia-200",
  every: "bg-emerald-500/15 border-emerald-400/20 text-emerald-200",
};

export default function CalendarPage() {
  const [anchor, setAnchor] = useState(() => new Date());

  const weekStart = useMemo(
    () => startOfWeek(anchor, { weekStartsOn: 1 }),
    [anchor]
  );
  const weekEnd = useMemo(() => endOfWeek(anchor, { weekStartsOn: 1 }), [
    anchor,
  ]);

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

  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = tasks.find((t) => t._id === selectedId) ?? null;

  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Calendar
          </h1>
          <div className="mt-1 text-xs text-white/50">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setAnchor((d) => subWeeks(d, 1))}>
            Prev
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
          <Button size="sm" onClick={() => setAnchor((d) => addWeeks(d, 1))}>
            Next
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
            Upcoming (this week)
          </div>
          <Badge tone="neutral">{tasks.length}</Badge>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
          {tasks.slice(0, 4).map((t) => (
            <button
              key={t._id}
              onClick={() => setSelectedId(t._id)}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition-all hover:bg-white/[0.06]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-white">
                    {t.name}
                  </div>
                  <div className="mt-1 text-[11px] text-white/55">
                    {format(new Date(t.nextRunTs), "EEE HH:mm")}
                  </div>
                </div>
                <span
                  className={
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold " +
                    (KIND_COLORS[t.kind] ?? "bg-white/[0.06] border-white/10 text-white/70")
                  }
                >
                  {t.kind}
                </span>
              </div>
            </button>
          ))}
          {tasks.length === 0 ? (
            <div className="text-xs text-white/40">No tasks scheduled.</div>
          ) : null}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden">
          <div className="grid grid-cols-8 border-b border-white/10 bg-white/[0.02] text-xs text-white/55">
            <div className="p-3" />
            {days.map((d) => {
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={dayKey(d)}
                  className={
                    "p-3 text-center border-l border-white/10 " +
                    (isToday ? "bg-white/[0.04]" : "")
                  }
                >
                  <div
                    className={
                      "text-[10px] font-bold uppercase tracking-widest " +
                      (isToday ? "text-[color:var(--accent)]" : "text-white/45")
                    }
                  >
                    {format(d, "EEE")}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {format(d, "d")}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-8 h-[620px] overflow-y-auto">
            <div className="border-r border-white/10 bg-black/20">
              {Array.from({ length: 24 }).map((_, h) => (
                <div
                  key={h}
                  className="h-[60px] border-b border-white/5 px-2 py-1 text-[10px] font-medium text-white/35"
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
                <div
                  key={k}
                  className={
                    "relative border-r border-white/10 last:border-r-0 " +
                    (isToday ? "bg-white/[0.015]" : "")
                  }
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <div key={h} className="h-[60px] border-b border-white/5" />
                  ))}

                  {dayTasks.map((t) => {
                    const dt = new Date(t.nextRunTs);
                    const minutes = dt.getHours() * 60 + dt.getMinutes();
                    const top = minutes;
                    const tone = KIND_COLORS[t.kind] ?? "bg-white/[0.05] border-white/10 text-white/70";
                    return (
                      <button
                        key={t._id}
                        onClick={() => setSelectedId(t._id)}
                        className={
                          "absolute left-1 right-1 rounded-xl border px-2 py-1 text-left shadow-sm transition-all duration-150 hover:translate-y-[-1px] hover:shadow-md " +
                          (t.enabled ? tone : "bg-white/[0.03] border-white/10 text-white/35 opacity-60")
                        }
                        style={{ top, height: 34 }}
                        title={t.payloadSummary}
                      >
                        <div className="truncate text-[10px] font-bold leading-tight">
                          {t.name}
                        </div>
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
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Task details</div>
            {selected ? (
              <Badge tone={selected.enabled ? "success" : "neutral"}>
                {selected.enabled ? "Enabled" : "Disabled"}
              </Badge>
            ) : null}
          </div>

          {!selected ? (
            <div className="mt-6 text-sm text-white/50">Select a task.</div>
          ) : (
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                  Name
                </div>
                <div className="mt-1 font-medium text-white">{selected.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                    Kind
                  </div>
                  <div className="mt-1 text-white/80">{selected.kind}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                    Next run
                  </div>
                  <div className="mt-1 text-white/80">
                    {new Date(selected.nextRunTs).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                  Schedule
                </div>
                <div className="mt-1 rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-xs text-white/70">
                  {selected.schedule}
                  {selected.tz ? (
                    <span className="ml-2 text-white/40">({selected.tz})</span>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                  Payload
                </div>
                <pre className="mt-1 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
                  {selected.payloadSummary}
                </pre>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                  External ID
                </div>
                <div className="mt-1 break-all font-mono text-xs text-white/50">
                  {selected.externalId}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
