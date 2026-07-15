// useStreak.ts = data logic/ APi logic / state manager [merged into useHabitAnalytics.ts]
// StreakStats = display UI/visual component [merged into HabitAnalytics]
import type { StreakSummary } from "../../../shared/types/api.types";
import { formatDateRange } from "../../../shared/utils/dateUtils";
import type { CompletionPeriodStats } from "../hooks/useHabitAnalytics";

export type HabitAnalyticsProps = {
  lastSevenDays: CompletionPeriodStats;
  lastThirtyDays: CompletionPeriodStats;
  completionError?: string | null;
  completionIsLoading?: boolean;
  streak: StreakSummary | null;
  streakError?: string | null;
  streakIsLoading?: boolean;
};

type CompletionRateCardProps = {
  label: "Last 7 days" | "Last 30 days";
  period: CompletionPeriodStats;
  icon: "week" | "month";
  isLoading: boolean;
};

function PeriodIcon({ type }: { type: "week" | "month" }) {
  const toneClass =
    type === "week"
      ? "bg-[var(--app-accent-soft)] text-[var(--app-current)]"
      : "bg-[var(--app-warm-soft)] text-[var(--app-warm)]";

  return (
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${toneClass}`}>
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        {type === "week" ? (
          <path
            d="M7 3v3m10-3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm2 8h2m2 0h2m2 0h1M8 16h2m2 0h2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        ) : (
          <path
            d="M4 19V9m5 10V5m5 14v-7m5 7V3M3 21h18"
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

function CompletionRateCard({ label, period, icon, isLoading }: CompletionRateCardProps) {
  const safePercentage = Math.min(100, Math.max(0, period.percentage));
  const surfaceClass = icon === "week" ? "bg-[var(--app-current-card)]" : "bg-[var(--app-streak-card)]";
  const metricClass = icon === "week" ? "text-[var(--app-current)]" : "text-[var(--app-warm)]";

  return (
    <article className={`min-w-0 rounded-[22px] border border-[var(--app-border)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_28px_var(--app-shadow)] ${surfaceClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <PeriodIcon type={icon} />
          <h3 className="text-lg font-bold leading-tight text-[var(--app-title)]">{label}</h3>
        </div>
        <span className="whitespace-nowrap text-xs font-semibold text-[var(--app-muted)] [font-family:var(--font-data)]">
          {isLoading ? `â€” of ${period.totalDays} days` : `${period.completedDays} of ${period.totalDays} days`}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div
          aria-label={`${label} completion rate`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={isLoading ? undefined : safePercentage}
          aria-valuetext={isLoading ? "Loading completion rate" : `${safePercentage}%`}
          className="h-3.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--app-calendar-idle)]"
          role="progressbar"
        >
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--app-accent),var(--app-current))] transition-[width] duration-500 ease-out"
            style={{ width: `${isLoading ? 0 : safePercentage}%` }}
          />
        </div>
        <strong className={`w-10 shrink-0 text-right text-sm font-bold [font-family:var(--font-data)] ${metricClass}`}>
          {isLoading ? "â€”" : `${safePercentage}%`}
        </strong>
      </div>
    </article>
  );
}

function ProgressLensStats({
  lastSevenDays,
  lastThirtyDays,
  isLoading = false,
  error = null,
}: {
  lastSevenDays: CompletionPeriodStats;
  lastThirtyDays: CompletionPeriodStats;
  isLoading?: boolean;
  error?: string | null;
}) {
  return (
    <section aria-busy={isLoading} aria-live="polite" className="grid gap-4">
      <CompletionRateCard icon="week" isLoading={isLoading} label="Last 7 days" period={lastSevenDays} />
      <CompletionRateCard icon="month" isLoading={isLoading} label="Last 30 days" period={lastThirtyDays} />

      {error ? (
        <p className="text-xs font-medium text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

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

function StreakStats({
  streak,
  error = null,
  isLoading = false,
}: {
  streak: StreakSummary | null;
  error?: string | null;
  isLoading?: boolean;
}) {
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

export function HabitAnalytics({
  lastSevenDays,
  lastThirtyDays,
  completionError = null,
  completionIsLoading = false,
  streak,
  streakError = null,
  streakIsLoading = false,
}: HabitAnalyticsProps) {
  return (
    <div className="grid gap-4">
      <ProgressLensStats
        error={completionError}
        isLoading={completionIsLoading}
        lastSevenDays={lastSevenDays}
        lastThirtyDays={lastThirtyDays}
      />
      <StreakStats error={streakError} isLoading={streakIsLoading} streak={streak} />
    </div>
  );
}
