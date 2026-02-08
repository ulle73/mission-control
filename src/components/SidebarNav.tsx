"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/activity", label: "Activity" },
  { href: "/calendar", label: "Calendar" },
  { href: "/search", label: "Search" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="p-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-white/[0.06] border border-white/10 shadow-inner" />
          <div>
            <div className="text-sm font-semibold tracking-wide text-white">
              Mission Control
            </div>
            <div className="text-[11px] text-white/50">Operations Dashboard</div>
          </div>
        </div>

        <div className="mt-6 space-y-1">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={
                  "group flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all duration-150 " +
                  (active
                    ? "bg-white/[0.08] border border-white/12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                    : "text-white/70 hover:text-white hover:bg-white/[0.06]")
                }
              >
                <span className="font-medium">{it.label}</span>
                <span
                  className={
                    "h-2 w-2 rounded-full transition-opacity " +
                    (active
                      ? "opacity-100 bg-[color:var(--accent)]"
                      : "opacity-0 group-hover:opacity-60 bg-white/40")
                  }
                />
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[11px] font-semibold text-white/80">Tip</div>
          <div className="mt-1 text-[11px] leading-relaxed text-white/55">
            Use Search to find any memory, task or activity across your workspace.
          </div>
        </div>
      </div>
    </aside>
  );
}
