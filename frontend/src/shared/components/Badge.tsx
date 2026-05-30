import type { ReactNode } from "react";

export type BadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning";
};

const toneClasses = {
  neutral: "bg-zinc-100 text-zinc-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
