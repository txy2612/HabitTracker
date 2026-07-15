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

function StreakIcon({ type }: { type: "current" | "longest" }) {
  const toneClass =
    type === "longest"
      ? "bg-[var(--app-warm-soft)] text-[var(--app-warm)]"
      : "bg-[var(--app-accent-soft)] text-[var(--app-current)]";

  return (
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${toneClass}`}>
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        {type === "longest" ? (
          <path
            d="M8 4h8v3.5a4 4 0 0 1-8 0V4ZM6 5H4.5A2.5 2.5 0 0 0 7 9.5M18 5h1.5A2.5 2.5 0 0 1 17 9.5M12 12v4m-3 4h6m-7 0h8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        ) : (
          <path
            d="m13 3-7 10h5l-1 8 7-10h-5l1-8Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        )}
      </svg>
    </span>
  );
}

export function StreakStats({ streak, error = null, isLoading = false }: StreakStatsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-streak-card)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_28px_var(--app-shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 items-center gap-3">
            <StreakIcon type="longest" />
            <h3 className="text-lg font-bold leading-tight text-[var(--app-title)]">Longest Streak</h3>
          </div>
          <strong className="whitespace-nowrap text-sm font-bold text-[var(--app-warm)] [font-family:var(--font-data)]">
            {streak?.highestStreak ?? 0} {dayLabel(streak?.highestStreak ?? 0)}
          </strong>
        </div>
        <p className="mt-3 text-xs font-medium text-[var(--app-muted)]">
          {formatDateRange(streak?.highestStartDate ?? null, streak?.highestEndDate ?? null)}
        </p>
      </article>

      <article className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-current-card)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_28px_var(--app-shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 items-center gap-3">
            <StreakIcon type="current" />
            <h3 className="text-lg font-bold leading-tight text-[var(--app-title)]">Current Streak</h3>
          </div>
          <strong className="whitespace-nowrap text-sm font-bold text-[var(--app-current)] [font-family:var(--font-data)]">
            {streak?.currentStreak ?? 0} {dayLabel(streak?.currentStreak ?? 0)}
          </strong>
        </div>
        <p className="mt-3 text-xs font-medium text-[var(--app-muted)]">
          {streak?.lastCompletedDate
            ? `Last completed ${formatDateRange(streak.lastCompletedDate, streak.lastCompletedDate)}`
            : "No completed dates"}
        </p>
      </article>

      {isLoading ? <p className="text-xs text-[var(--app-muted)] sm:col-span-2">Loading streak...</p> : null}
      {error ? <p className="text-xs text-red-500 sm:col-span-2">{error}</p> : null}
    </section>
  );
}
