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

function getCircleClasses(date: string, log?: HabitLog) {
  const today = todayString();
  const isToday = date === today;

  if (date > today) {
    return "cursor-not-allowed bg-slate-50/40 text-slate-300 opacity-60";
  }

  if (log?.status === "done") {
    return "bg-[#22c55e] text-white";
  }

  if (log?.status === "missed") {
    return "bg-[#d1d5db] text-slate-700";
  }

  return isToday ? "bg-[#d1d5db] text-slate-700" : "bg-[#e5e7eb] text-slate-600";
}

function getConnectorClasses(leftDate: string, rightDate: string, leftLog?: HabitLog, rightLog?: HabitLog) {
  const today = todayString();

  if (leftDate > today || rightDate > today || !leftLog || !rightLog) {
    return "bg-transparent";
  }

  return leftLog.status === "done" && rightLog.status === "done" ? "bg-[#22c55e]" : "bg-[#d1d5db]";
}

export function StreakDotsRow({ dates, logs, onSelectDate }: StreakDotsRowProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-max">
        <div className="mb-2 flex items-center">
          {dates.map((date, index) => (
            <div className="flex items-center" key={`label-${date}`}>
              <span className="block w-10 text-center text-[10px] font-medium text-[#9ca3af]">
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
                    isFutureDate ? "" : "hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
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
