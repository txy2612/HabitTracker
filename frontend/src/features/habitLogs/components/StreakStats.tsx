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
    <section className="rounded-lg bg-slate-50 px-4 py-4">
      <p className="text-sm text-slate-500">Longest Streak</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <strong className="text-lg font-semibold text-slate-950">
          {streak?.highestStreak ?? 0} {dayLabel(streak?.highestStreak ?? 0)}
        </strong>
        <span className="text-sm text-slate-500">
          {formatDateRange(streak?.highestStartDate ?? null, streak?.highestEndDate ?? null)}
        </span>
      </div>

      {streak && streak.currentStreak > 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          Current: {streak.currentStreak} {dayLabel(streak.currentStreak)} (
          {formatDateRange(streak.currentStartDate, streak.currentEndDate)})
        </p>
      ) : null}

      {isLoading ? <p className="mt-2 text-xs text-slate-400">Loading streak...</p> : null}
      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
    </section>
  );
}
