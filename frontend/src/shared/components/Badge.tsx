import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "success" | "neutral" | "warning";
};

const tones = {
  success: "bg-emerald-100 text-emerald-800",
  neutral: "bg-zinc-100 text-zinc-700",
  warning: "bg-amber-100 text-amber-800",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}
