import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur supports-[backdrop-filter]:bg-white/[0.035] transition-all duration-200 " +
        "hover:bg-white/[0.06] hover:border-white/15 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_40px_-20px_rgba(0,0,0,0.8)] " +
        className
      }
    >
      {children}
    </div>
  );
}
