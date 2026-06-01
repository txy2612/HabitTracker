// HabitDetailPage = parent/container (also a component)
// MonthlyCalender = UI child component
    // draws the month calendar circles and connecting lines
import type { HabitLog } from "../../../shared/types/api.types";
import { getDayNumber, getMonthCalendarDates, todayString } from "../../../shared/utils/dateUtils";

// passed from HabitDetailPage in JSX 
/*
  <MonthlyCalendar
    logs={logs}
    month={month}
    onSelectDate={setSelectedDate}
  />
*/
export type MonthlyCalendarProps = {
  month: string;
  logs: HabitLog[];
  onSelectDate: (date: string) => void;
};

export function MonthlyCalendar({ month, logs, onSelectDate }: MonthlyCalendarProps) {
  // creates full calender grid
  const calendarDates = getMonthCalendarDates(month);
  const today = todayString();

  // Fast Look up:
  // Instead of searching thru array evtime using logs.find
  // creates a map like "date1" => log, "date2" => log, ...
  const logsByDate = new Map(logs.map((log) => [log.logDate, log]));

  // then this is fast .get
  function getLog(date: string) {
    return logsByDate.get(date);
  }

  // -- Line connection logic
  function canConnect(date: string) {
    if (date > today) {
      return false;
    }

    const log = getLog(date);// log = LOg or underfined

    // if log exist & not skipped -> true && true
    return Boolean(log && log.status !== "skipped");
  }

  function segmentClass(leftDate: string, rightDate: string) {
    if (leftDate > today || rightDate > today) {
      return "";
    }

    const leftLog = getLog(leftDate);
    const rightLog = getLog(rightDate);

    if (!leftLog || !rightLog || leftLog.status === "skipped" || rightLog.status === "skipped") {
      return "";
    }

    return leftLog.status === "done" && rightLog.status === "done" ? "bg-[#22c55e]" : "bg-slate-300";
  }

  // -- Circle color logic --
  function circleClass(date: string, isCurrentMonth: boolean) {
    const log = getLog(date);

    if (date > today) {
      return "cursor-not-allowed bg-slate-50/40 text-slate-300 opacity-60";
    }

    // blurred pale circle
    if (!isCurrentMonth) {
      return "bg-slate-100 text-slate-300 blur-[0.3px]";
    }
    // green circle
    if (log?.status === "done") {
      return "bg-[#22c55e] text-white";
    }
    // Missed → grey circle
    if (log?.status === "missed") {
      return "bg-slate-300 text-slate-600";
    }
    // no log -> light grey circle
    return "bg-slate-200 text-slate-600";
  }

  return (
    <section className="grid gap-4">
      <div className="grid grid-cols-7 text-center text-sm font-medium text-slate-500">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-4">
        {calendarDates.map(({ date, isCurrentMonth }, index) => {
          const isFutureDate = date > today;
          const previousDate = calendarDates[index - 1]?.date;
          const nextDate = calendarDates[index + 1]?.date;
          const isWeekStart = index % 7 === 0;
          const isWeekEnd = index % 7 === 6;
          const leftSegment =
            previousDate && !isWeekStart && canConnect(date) ? segmentClass(previousDate, date) : "";
          const rightSegment =
            nextDate && !isWeekEnd && canConnect(date) ? segmentClass(date, nextDate) : "";

          return (
            <div className="relative flex h-12 items-center justify-center" key={date}>
              {leftSegment ? (
                <span className={`absolute left-0 top-1/2 h-1 w-1/2 -translate-y-1/2 ${leftSegment}`} />
              ) : null}
              {rightSegment ? (
                <span className={`absolute right-0 top-1/2 h-1 w-1/2 -translate-y-1/2 ${rightSegment}`} />
              ) : null}
              <button
                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold transition ${
                  isFutureDate ? "" : "hover:ring-2 hover:ring-emerald-100"
                } ${circleClass(
                  date,
                  isCurrentMonth,
                )}`}
                disabled={isFutureDate}
                onClick={() => {
                  if (!isFutureDate) {
                    onSelectDate(date);
                  }
                }}
                type="button"
              >
                {getDayNumber(date)}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
