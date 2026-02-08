"use client";

import { ReactNode, useMemo } from "react";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

function isAbsoluteUrl(value: string) {
  try {
    return URL.canParse(value);
  } catch {
    return false;
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;

  const client = useMemo(() => {
    if (!url || !isAbsoluteUrl(url)) return null;
    return new ConvexReactClient(url);
  }, [url]);

  if (!url || !isAbsoluteUrl(url) || !client) {
    return (
      <div className="p-6">
        <Card className="mx-auto max-w-2xl p-6">
          <div className="text-lg font-semibold text-white">
            Convex is not configured
          </div>
          <p className="mt-2 text-sm text-white/60">
            Set <span className="font-mono">NEXT_PUBLIC_CONVEX_URL</span> to an
            absolute URL (e.g. <span className="font-mono">http://127.0.0.1:3210</span>)
            in <span className="font-mono">.env.local</span>.
          </p>

          <div className="mt-4 space-y-2 text-xs text-white/55">
            <div className="font-semibold text-white/70">Local setup</div>
            <pre className="rounded-xl border border-white/10 bg-black/30 p-3 text-[11px] text-white/70">
{`pnpm dlx convex@latest dev --once --configure=new
# then
pnpm dev`}
            </pre>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reload
            </Button>
            <a
              className="text-sm text-white/60 underline underline-offset-4 hover:text-white"
              href="https://docs.convex.dev/"
              target="_blank"
              rel="noreferrer"
            >
              Convex docs
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
