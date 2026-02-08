import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

export async function POST(req: Request) {
  const secret = req.headers.get("x-sync-secret") ?? "";
  if (!process.env.SYNC_SECRET || secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json();
  const tasks =
    typeof body === "object" &&
    body !== null &&
    "tasks" in body &&
    Array.isArray((body as { tasks: unknown[] }).tasks)
      ? (body as { tasks: unknown[] }).tasks
      : [];

  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  const results: string[] = [];
  for (const raw of tasks) {
    const t = (raw ?? {}) as Record<string, unknown>;
    const kind =
      t.kind === "at" ? "at" : t.kind === "every" ? "every" : "cron";

    const id = await client.mutation(api.tasks.upsertScheduledTask, {
      externalId: String(t.externalId),
      name: String(t.name ?? t.externalId),
      kind,
      schedule: String(t.schedule ?? ""),
      tz: t.tz ? String(t.tz) : undefined,
      nextRunTs: Number(t.nextRunTs ?? Date.now()),
      enabled: Boolean(t.enabled ?? true),
      payloadSummary: String(t.payloadSummary ?? ""),
    });
    results.push(id);
  }

  return NextResponse.json({ ok: true, count: results.length, ids: results });
}
