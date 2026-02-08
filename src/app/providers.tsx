"use client";

import { ReactNode, useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";

export function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      console.warn("NEXT_PUBLIC_CONVEX_URL is not set");
    }
    return new ConvexReactClient(url ?? "");
  }, []);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
