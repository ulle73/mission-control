import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "outline";
type Size = "sm" | "md";

export function Button({
  className = "",
  variant = "outline",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black " +
    "active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

  const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-xs",
    md: "h-10 px-4 text-sm",
  };

  const variants: Record<Variant, string> = {
    primary:
      "bg-[color:var(--accent)] text-black hover:brightness-110 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
    outline:
      "border border-white/12 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:border-white/20",
    ghost: "text-white/80 hover:text-white hover:bg-white/[0.06]",
  };

  return (
    <button
      {...props}
      className={[base, sizes[size], variants[variant], className].join(" ")}
    />
  );
}
