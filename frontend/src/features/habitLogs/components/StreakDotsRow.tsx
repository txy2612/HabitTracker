import type { HabitLog } from "../../../shared/types/api.types";
import { getDayNumber, getTodayIsoDate } from "../../../shared/utils/dateUtils";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type StreakDotsRowProps = {
  dates: string[];
  logs: HabitLog[];
  onSelectDate?: (date: string) => void;
};

function getLogForDate(logs: HabitLog[], date: string) {
  return logs.find((log) => log.logDate === date);
}

function getCircleClasses(date: string, log?: HabitLog) {
  const isToday = date === getTodayIsoDate();

  if (log?.status === "done") {
    return "bg-[#22c55e] text-white";
  }

  if (log?.status === "missed") {
    return "bg-[#d1d5db] text-slate-700";
  }

  return isToday ? "bg-[#d1d5db] text-slate-700" : "bg-[#e5e7eb] text-slate-600";
}

function getConnectorClasses(leftLog?: HabitLog, rightLog?: HabitLog) {
  if (!leftLog || !rightLog) {
    return "bg-transparent";
  }

  return leftLog.status === "done" && rightLog.status === "done" ? "bg-[#22c55e]" : "bg-[#d1d5db]";
}

export function StreakDotsRow({ dates, logs, onSelectDate }: StreakDotsRowProps) {
  const visibleWeekdayLabels = weekdayLabels.slice(0, dates.length);

  return (
    <div>
      <div className="mb-2 flex items-center">
        {visibleWeekdayLabels.map((label, index) => (
          <div className="flex items-center" key={`${label}-${index}`}>
            <span className="block w-10 text-center text-[11px] font-medium text-[#9ca3af]">
              {label}
            </span>
            {index < visibleWeekdayLabels.length - 1 ? <span className="w-3 shrink-0" aria-hidden="true" /> : null}
          </div>
        ))}
      </div>

      <div className="flex items-center">
        {dates.map((date, index) => {
          const log = getLogForDate(logs, date);
          const nextLog = dates[index + 1] ? getLogForDate(logs, dates[index + 1]) : undefined;

          return (
            <div className="flex items-center" key={date}>
              <button
                aria-label={`Edit log for ${date}`}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${getCircleClasses(date, log)}`}
                onClick={() => onSelectDate?.(date)}
                type="button"
              >
                {getDayNumber(date)}
              </button>

              {index < dates.length - 1 ? (
                <span
                  className={`h-0.5 w-3 shrink-0 ${getConnectorClasses(log, nextLog)}`}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
