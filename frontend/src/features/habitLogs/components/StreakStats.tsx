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
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
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
  );
}

export function StreakStats({ streak, error = null, isLoading = false }: StreakStatsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <article className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-streak-card)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_40px_var(--app-shadow)]">
        <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--app-warm)]">
          <StreakIcon type="longest" />
          Longest Streak
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <strong className="text-xl font-bold text-[var(--app-data)]">
            {streak?.highestStreak ?? 0} {dayLabel(streak?.highestStreak ?? 0)}
          </strong>
          <span className="text-sm font-medium text-[var(--app-muted)]">
            {formatDateRange(streak?.highestStartDate ?? null, streak?.highestEndDate ?? null)}
          </span>
        </div>
      </article>

      <article className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-current-card)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_40px_var(--app-shadow)]">
        <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--app-current)]">
          <StreakIcon type="current" />
          Current
        </p>
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
