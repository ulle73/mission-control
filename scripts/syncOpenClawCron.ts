import { execSync } from "node:child_process";

async function main() {
  const syncSecret = process.env.SYNC_SECRET;
  const syncEndpoint = process.env.SYNC_ENDPOINT || "http://localhost:3000/api/scheduled-tasks/sync";

  if (!syncSecret) {
    console.error("Error: SYNC_SECRET environment variable is not set.");
    console.error("Please add SYNC_SECRET to your .env.local file.");
    process.exit(1);
  }

  console.log("Fetching cron jobs from OpenClaw...");

  let jobs = [];
  try {
    const output = execSync("openclaw cron list --json", { encoding: "utf8" });
    const data = JSON.parse(output);
    jobs = data.jobs || [];
  } catch {
    console.warn("Warning: Failed to parse OpenClaw JSON output. Attempting fallback text parsing...");
    try {
      const output = execSync("openclaw cron list", { encoding: "utf8" });
      const lines = output.trim().split("\n");
      const startIdx = lines[0].toLowerCase().includes("id") ? 1 : 0;
      
      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(/\s{2,}/);
        if (parts.length >= 4) {
          jobs.push({
            id: parts[0],
            name: parts[1],
            schedule: parts[2],
            enabled: parts[3].toLowerCase() === "true",
            prompt: parts[1]
          });
        }
      }
    } catch (fallbackErr) {
      console.error("Error: Failed to fetch OpenClaw jobs using both JSON and text methods.");
      console.error(fallbackErr);
      process.exit(1);
    }
  }

  if (jobs.length === 0) {
    console.log("No OpenClaw cron jobs found to sync.");
    return;
  }

  console.log(`Mapping ${jobs.length} jobs to scheduledTasks schema...`);

  interface OpenClawJob {
    id: string;
    name?: string;
    schedule: string;
    enabled: boolean;
    prompt?: string;
    description?: string;
    state?: {
      nextRun?: string;
    };
    timezone?: string;
  }

  const tasks = jobs.map((job: OpenClawJob) => {
    return {
      externalId: job.id,
      name: job.name || job.id,
      kind: "cron",
      schedule: job.schedule,
      enabled: typeof job.enabled === "boolean" ? job.enabled : true,
      nextRunTs: job.state?.nextRun ? new Date(job.state.nextRun).getTime() : Date.now(),
      payloadSummary: job.prompt || job.description || "OpenClaw task",
      tz: job.timezone || undefined
    };
  });

  console.log(`Sending ${tasks.length} tasks to ${syncEndpoint}...`);

  try {
    const response = await fetch(syncEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Secret": syncSecret,
      },
      body: JSON.stringify({ tasks }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Sync successful!");
    console.log(`Result: ${result.count} tasks upserted.`);
  } catch (err) {
    console.error("Error: Failed to push tasks to Convex.");
    console.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled Error:");
  console.error(err);
  process.exit(1);
});
