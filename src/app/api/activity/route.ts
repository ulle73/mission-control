import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export async function POST(req: Request) {
  const secret = req.headers.get("x-activity-secret") ?? "";
  if (!process.env.ACTIVITY_SECRET || secret !== process.env.ACTIVITY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  const id = await client.mutation(api.activity.logEvent, {
    ts: body.ts,
    type: body.type ?? "action",
    title: body.title ?? "(untitled)",
    details: body.details,
    status: body.status ?? "info",
    tags: body.tags ?? [],
    source: body.source ?? "openclaw",
    metadata: body.metadata ?? null,
  });

  return NextResponse.json({ ok: true, id });
}
