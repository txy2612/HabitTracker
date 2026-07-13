import type { HabitLog } from "../../../shared/types/api.types";
import { formatRecentDayLabel, getDayNumber, todayString } from "../../../shared/utils/dateUtils";

export type StreakDotsRowProps = {
  dates: string[];
  logs: HabitLog[];
  onSelectDate?: (date: string) => void;
};

function getLogForDate(logs: HabitLog[], date: string) {
  return logs.find((log) => log.logDate === date);
}

const doneCircleClasses = [
  "bg-[var(--app-calendar-done-1)] text-white",
  "bg-[var(--app-calendar-done-2)] text-white",
  "bg-[var(--app-calendar-done-3)] text-white",
  "bg-[var(--app-calendar-done-4)] text-white",
  "bg-[var(--app-calendar-done-5)] text-white",
];

const doneConnectorClasses = [
  "bg-[var(--app-calendar-line-1)]",
  "bg-[var(--app-calendar-line-2)]",
  "bg-[var(--app-calendar-line-3)]",
  "bg-[var(--app-calendar-line-4)]",
  "bg-[var(--app-calendar-line-5)]",
];

function getDoneCircleClasses(date: string) {
  const dayNumber = Number(date.slice(-2));
  return doneCircleClasses[dayNumber % doneCircleClasses.length];
}

function getDoneConnectorClasses(date: string) {
  const dayNumber = Number(date.slice(-2));
  return doneConnectorClasses[dayNumber % doneConnectorClasses.length];
}

function getCircleClasses(date: string, log?: HabitLog) {
  const today = todayString();
  const isToday = date === today;

  if (date > today) {
    return "cursor-not-allowed bg-[var(--app-control-surface)] text-[var(--app-muted)] opacity-50";
  }

  if (log?.status === "done") {
    return getDoneCircleClasses(date);
  }

  if (log?.status === "missed") {
    return "bg-[var(--app-calendar-missed)] text-[var(--app-calendar-missed-text)]";
  }

  return isToday
    ? "bg-[var(--app-calendar-missed)] text-[var(--app-calendar-missed-text)]"
    : "bg-[var(--app-calendar-idle)] text-[var(--app-calendar-idle-text)]";
}

function getConnectorClasses(leftDate: string, rightDate: string, leftLog?: HabitLog, rightLog?: HabitLog) {
  const today = todayString();

  if (leftDate > today || rightDate > today || !leftLog || !rightLog) {
    return "bg-transparent";
  }

  return leftLog.status === "done" && rightLog.status === "done"
    ? getDoneConnectorClasses(leftDate)
    : "bg-transparent";
}

export function StreakDotsRow({ dates, logs, onSelectDate }: StreakDotsRowProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-max">
        <div className="mb-2 flex items-center">
          {dates.map((date, index) => (
            <div className="flex items-center" key={`label-${date}`}>
              <span className="block w-10 text-center text-[10px] font-medium text-[var(--app-muted)]">
                {formatRecentDayLabel(date)}
              </span>
              {index < dates.length - 1 ? <span className="w-3 shrink-0" aria-hidden="true" /> : null}
            </div>
          ))}
        </div>

        <div className="flex items-center">
          {dates.map((date, index) => {
            const isFutureDate = date > todayString();
            const log = getLogForDate(logs, date);
            const nextDate = dates[index + 1];
            const nextLog = nextDate ? getLogForDate(logs, nextDate) : undefined;

            return (
              <div className="flex items-center" key={date}>
                <button
                  aria-label={`Edit log for ${date}`}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold transition focus:outline-none ${
                    isFutureDate ? "" : "hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] focus-visible:ring-offset-2"
                  } ${getCircleClasses(date, log)}`}
                  disabled={isFutureDate}
                  onClick={(event) => {
                    event.stopPropagation();

                    if (!isFutureDate) {
                      onSelectDate?.(date);
                    }
                  }}
                  type="button"
                >
                  {getDayNumber(date)}
                </button>

                {index < dates.length - 1 ? (
                  <span
                    className={`h-0.5 w-3 shrink-0 ${nextDate ? getConnectorClasses(date, nextDate, log, nextLog) : "bg-transparent"}`}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
