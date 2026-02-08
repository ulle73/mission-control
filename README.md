# Mission Control Dashboard

Next.js (App Router) + TypeScript + Tailwind + Convex.

## Features

- **Activity Feed** (`/activity`)
  - Convex table `activityEvents`
  - `logEvent` mutation + paginated `listEvents` query
  - Next API: `POST /api/activity` (requires `X-Activity-Secret`)

- **Weekly Calendar** (`/calendar`)
  - Convex table `scheduledTasks`
  - `tasksInRange(startTs,endTs)` query
  - Next API: `POST /api/scheduled-tasks/sync` (requires `X-Sync-Secret`) to upsert tasks by `externalId`

- **Global Search** (`/search`)
  - Convex table `documents` (workspace markdown ingest)
  - `globalSearch(q)` query searches: documents, activity, scheduled tasks
  - Script: `pnpm ingest:workspace` to index `../MEMORY.md`, `../memory/**/*.md`, `../notes/**/*.md`

## Setup

### 1) Install

```bash
pnpm install
```

### 2) Configure Convex (local)

```bash
pnpm dlx convex@latest dev --once --configure=new
```

This writes `NEXT_PUBLIC_CONVEX_URL` into `.env.local`.

### 3) Add API secrets

Copy `.env.example` → `.env.local` and fill:

- `ACTIVITY_SECRET`
- `SYNC_SECRET`

(Keep `NEXT_PUBLIC_CONVEX_URL` from Convex.)

### 4) Run dev servers

In two terminals:

```bash
# Terminal A
pnpm convex:dev

# Terminal B
pnpm dev
```

Open http://localhost:3000

## Workspace ingest

```bash
pnpm ingest:workspace
```

## OpenClaw Sync

Sync your OpenClaw cron jobs with the dashboard:

```bash
pnpm sync:openclaw-cron
```

Requires `SYNC_SECRET` in `.env.local`.

### Automatic Sync

Schedule the sync within OpenClaw to run every 5 minutes:

```bash
openclaw cron add \
  --name "Sync to Mission Control" \
  --schedule "*/5 * * * *" \
  --prompt "cd $(pwd) && pnpm sync:openclaw-cron"
```

## API payloads

### POST /api/activity

Headers:
- `X-Activity-Secret: <ACTIVITY_SECRET>`

Body example:
```json
{
  "type": "task.run",
  "title": "Synced scheduled tasks",
  "details": "Upserted 12 tasks",
  "status": "success",
  "tags": ["cron"],
  "source": "openclaw",
  "metadata": {"count": 12}
}
```

### POST /api/scheduled-tasks/sync

Headers:
- `X-Sync-Secret: <SYNC_SECRET>`

Body:
```json
{
  "tasks": [
    {
      "externalId": "job_123",
      "name": "Daily sync",
      "kind": "cron",
      "schedule": "0 8 * * *",
      "tz": "Europe/Stockholm",
      "nextRunTs": 1739020800000,
      "enabled": true,
      "payloadSummary": "Runs ullebets sync"
    }
  ]
}
```
