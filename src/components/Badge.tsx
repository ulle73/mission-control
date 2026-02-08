import { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "error" | "info";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/[0.06] text-white/80 border-white/10",
    success: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
    error: "bg-red-500/15 text-red-200 border-red-400/20",
    info: "bg-sky-500/15 text-sky-200 border-sky-400/20",
  };

  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide " +
        tones[tone] +
        " " +
        className
      }
    >
      {children}
    </span>
  );
}
