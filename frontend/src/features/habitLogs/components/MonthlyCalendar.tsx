// HabitDetailPage = parent/container (also a component)
// MonthlyCalender = UI child component
    // draws the month calendar circles and connecting lines
import type { CSSProperties } from "react";
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
  highlightedDate?: string | null;
  onSelectDate: (date: string) => void;
};

const doneCircleClasses = [
  "bg-[var(--app-calendar-done-1)] text-white shadow-[0_0_22px_color-mix(in_srgb,var(--app-calendar-done-1)_44%,transparent)]",
  "bg-[var(--app-calendar-done-2)] text-white shadow-[0_0_22px_color-mix(in_srgb,var(--app-calendar-done-2)_40%,transparent)]",
  "bg-[var(--app-calendar-done-3)] text-white shadow-[0_0_22px_color-mix(in_srgb,var(--app-calendar-done-3)_38%,transparent)]",
  "bg-[var(--app-calendar-done-4)] text-white shadow-[0_0_22px_color-mix(in_srgb,var(--app-calendar-done-4)_38%,transparent)]",
  "bg-[var(--app-calendar-done-5)] text-white shadow-[0_0_22px_color-mix(in_srgb,var(--app-calendar-done-5)_38%,transparent)]",
];

function getDoneCircleClass(date: string) {
  const dayNumber = Number(date.slice(-2));
  return doneCircleClasses[dayNumber % doneCircleClasses.length];
}

function getDoneColorIndex(date: string) {
  const dayNumber = Number(date.slice(-2));
  return (dayNumber % doneCircleClasses.length) + 1;
}

function getDoneConnectorStyle(leftDate: string, rightDate: string, half: "first" | "second"): CSSProperties {
  const leftColor = `var(--app-calendar-line-${getDoneColorIndex(leftDate)})`;
  const rightColor = `var(--app-calendar-line-${getDoneColorIndex(rightDate)})`;

  return {
    background: `linear-gradient(90deg, ${leftColor}, ${rightColor})`,
    backgroundPosition: half === "first" ? "left center" : "right center",
    backgroundSize: "200% 100%",
  };
}

export function MonthlyCalendar({ month, logs, highlightedDate = null, onSelectDate }: MonthlyCalendarProps) {
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

  function segmentStyle(leftDate: string, rightDate: string, half: "first" | "second") {
    if (leftDate > today || rightDate > today) {
      return undefined;
    }

    const leftLog = getLog(leftDate);
    const rightLog = getLog(rightDate);

    if (!leftLog || !rightLog || leftLog.status === "skipped" || rightLog.status === "skipped") {
      return undefined;
    }

    return leftLog.status === "done" && rightLog.status === "done"
      ? getDoneConnectorStyle(leftDate, rightDate, half)
      : undefined;
  }

  // -- Circle color logic --
  function circleClass(date: string, isCurrentMonth: boolean) {
    const log = getLog(date);

    if (date > today) {
      return "cursor-not-allowed bg-[var(--app-control-surface)] text-[var(--app-muted)] opacity-45";
    }

    // blurred pale circle
    if (!isCurrentMonth) {
      return "bg-[var(--app-control-surface)] text-[var(--app-muted)] opacity-35 blur-[0.3px]";
    }
    // green circle
    if (log?.status === "done") {
      return getDoneCircleClass(date);
    }
    // Missed → grey circle
    if (log?.status === "missed") {
      return "bg-[var(--app-calendar-missed)] text-[var(--app-calendar-missed-text)]";
    }
    // no log -> light grey circle
    return "bg-[var(--app-calendar-idle)] text-[var(--app-calendar-idle-text)]";
  }

  return (
    <section className="grid gap-4">
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-[var(--app-text)]">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
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
            previousDate && !isWeekStart && canConnect(date) ? segmentStyle(previousDate, date, "second") : undefined;
          const rightSegment =
            nextDate && !isWeekEnd && canConnect(date) ? segmentStyle(date, nextDate, "first") : undefined;

          return (
            <div className="relative flex h-12 items-center justify-center" key={date}>
              {leftSegment ? (
                <span
                  className="absolute left-0 top-1/2 h-1 w-1/2 -translate-y-1/2 transition-all duration-500"
                  style={leftSegment}
                />
              ) : null}
              {rightSegment ? (
                <span
                  className="absolute right-0 top-1/2 h-1 w-1/2 -translate-y-1/2 transition-all duration-500"
                  style={rightSegment}
                />
              ) : null}
              <button
                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold transition duration-300 ${
                  highlightedDate === date ? "habit-complete-pulse" : ""
                } ${
                  isFutureDate ? "" : "hover:scale-105 hover:ring-2 hover:ring-[var(--app-accent-soft)]"
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
