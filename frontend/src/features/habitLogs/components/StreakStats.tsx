// useStreak.ts = data logic/ APi logic / state manager
// StreakStats = display UI/visual component
import type { StreakSummary } from "../../../shared/types/api.types";
import { formatDateRange } from "../../../shared/utils/dateUtils";

export type StreakStatsProps = {
  streak: StreakSummary | null;
  error?: string | null;
  isLoading?: boolean;
};

function dayLabel(count: number): string {
  return count === 1 ? "day" : "days";
}

export function StreakStats({ streak, error = null, isLoading = false }: StreakStatsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-streak-card)] px-5 py-4 shadow-[0_14px_32px_var(--app-shadow)]">
        <p className="text-sm font-bold text-[var(--app-warm)]">Longest Streak</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <strong className="text-xl font-bold text-[var(--app-data)]">
            {streak?.highestStreak ?? 0} {dayLabel(streak?.highestStreak ?? 0)}
          </strong>
          <span className="text-sm font-medium text-[var(--app-muted)]">
            {formatDateRange(streak?.highestStartDate ?? null, streak?.highestEndDate ?? null)}
          </span>
        </div>
      </article>

      <article className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-current-card)] px-5 py-4 shadow-[0_14px_32px_var(--app-shadow)]">
        <p className="text-sm font-bold text-[var(--app-current)]">Current</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <strong className="text-xl font-bold text-[var(--app-data)]">
            {streak?.currentStreak ?? 0} {dayLabel(streak?.currentStreak ?? 0)}
          </strong>
          <span className="text-sm font-medium text-[var(--app-muted)]">
            {formatDateRange(streak?.currentStartDate ?? null, streak?.currentEndDate ?? null)}
          </span>
        </div>
      </article>

      {isLoading ? <p className="text-xs text-[var(--app-muted)] sm:col-span-2">Loading streak...</p> : null}
      {error ? <p className="text-xs text-red-500 sm:col-span-2">{error}</p> : null}
    </section>
  );
}
