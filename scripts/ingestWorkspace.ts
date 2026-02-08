import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

function inferKind(p: string): "memory" | "note" | "doc" {
  if (p === "MEMORY.md" || p.startsWith("memory/")) return "memory";
  if (p.startsWith("notes/")) return "note";
  return "doc";
}

function titleFromMarkdown(p: string, content: string): string {
  const firstHeading = content
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith("# "));
  if (firstHeading) return firstHeading.replace(/^#\s+/, "").trim();
  return path.basename(p);
}

async function main() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is required (set it in .env.local)");
  }

  const client = new ConvexHttpClient(convexUrl);

  // Scan workspace root (one level up from this app)
  const root = path.resolve(__dirname, "..", "..");

  const patterns = ["MEMORY.md", "memory/**/*.md", "notes/**/*.md"];

  const matches = await fg(patterns, {
    cwd: root,
    onlyFiles: true,
    dot: false,
  });

  let count = 0;
  for (const rel of matches) {
    const abs = path.join(root, rel);
    const stat = await fs.stat(abs);
    const content = await fs.readFile(abs, "utf8");

    await client.mutation(api.documents.upsertDocument, {
      path: rel,
      title: titleFromMarkdown(rel, content),
      content,
      kind: inferKind(rel),
      updatedAt: stat.mtimeMs,
    });
    count += 1;
  }

  console.log(`Ingested ${count} documents into Convex.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
