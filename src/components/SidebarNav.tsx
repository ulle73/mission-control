import Link from "next/link";

const items = [
  { href: "/activity", label: "Activity" },
  { href: "/calendar", label: "Calendar" },
  { href: "/search", label: "Search" },
];

export function SidebarNav() {
  return (
    <aside className="w-64 border-r bg-white/50 backdrop-blur">
      <div className="p-4">
        <div className="text-sm font-semibold tracking-wide text-gray-900">
          Mission Control
        </div>
        <div className="mt-6 space-y-1">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {it.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
