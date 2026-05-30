import type { HabitLogStatus } from "../types/api.types";

export type StatusDotProps = {
  status?: HabitLogStatus;
};

const statusClasses = {
  done: "bg-emerald-500",
  missed: "bg-zinc-400",
  skipped: "bg-amber-400",
  empty: "bg-zinc-200 opacity-60",
};

export function StatusDot({ status }: StatusDotProps) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${status ? statusClasses[status] : statusClasses.empty}`}
      aria-hidden="true"
    />
  );
}
