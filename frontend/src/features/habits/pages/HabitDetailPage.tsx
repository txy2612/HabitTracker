import { useEffect, useMemo, useRef, useState } from "react";
import { HabitAnalytics } from "../components/HabitAnalytics";
import { LogNoteEditor } from "../components/LogNoteEditor";
import { MonthlyCalendar } from "../components/MonthlyCalendar";
import { useHabitAnalytics } from "../hooks/useHabitAnalytics";
import { useHabitLogs } from "../hooks/useHabitLogs";
import type { Habit, HabitLogStatus } from "../../../shared/types/api.types";
import { currentMonthString, formatMonthName, shiftMonth } from "../../../shared/utils/dateUtils";

// this component receive these props
// in React, page IS a component
// how to know parent? -> serach project-wide for <HabitDetailPage OR HabitDetailPage(
export type HabitDetailPageProps = {
  habit: Habit;// the habit being viewed
  onClose: () => void;// the function used when user clicks Close
  // ? = optional bcz first habit has no prev,last habit no next
  onPreviousHabit?: () => void;
  onNextHabit?: () => void;
};

export function HabitDetailPage({ 
  habit, 
  onClose,
  onPreviousHabit,
  onNextHabit,
 }: HabitDetailPageProps) {
  const yearMenuRef = useRef<HTMLDivElement | null>(null);
  const [month, setMonth] = useState(currentMonthString());// stores the current viewed month
  const [selectedDate, setSelectedDate] = useState<string | null>(null);// stores the date user clicked -> controls whether the modal popup/close
  const [highlightedDate, setHighlightedDate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const { logs, isLoading, error, saveLog } = useHabitLogs(habit.id, month);

  // destructuring
  /* w/o destructuring:
    const streak = returnedObject.streak;
    const isLoading = returnedObject.isLoading;
    const error = returnedObject.error;
   */
  const {
    lastSevenDays,
    lastThirtyDays,
    completionIsLoading,
    completionError,
    streak,
    streakIsLoading,
    streakError,
    refreshAnalytics,
  } = useHabitAnalytics(habit.id); 
  /* suppose habit ={
      id: "habit-123",
      name: "Read 22 pages",
      } 
      
      useHabitAnalytics("habit-123")
      -> fetch & cal completion + streak stats for this statictics

      Because the hook alr contains useEffect, we DO NOT need another:
      useEffect(() = {
        refreshAnalytics()
      },[habit.id]);

      That would duplicate fetching
  */
 // w/o destructuring: const refreshAnalytics = habitAnalytics.refreshAnalytics;

  const selectedLog = selectedDate ? logs.find((log) => log.logDate === selectedDate) : undefined;// if a date selected -> find the log for that date, if found, pass to LogNoteEditor (bottom of this file)
  const currentMonth = currentMonthString();
  const [currentYear, currentMonthNumber] = currentMonth.split("-").map(Number);
  const [selectedYear, selectedMonthNumber] = month.split("-").map(Number);
  const createdYear = Number(habit.createdAt.slice(0, 4));
  const isCurrentViewedMonth = month === currentMonth;
  const yearOptions = useMemo(() => {
    const startYear = Math.min(createdYear, selectedYear, currentYear - 5);
    const years: number[] = [];

    for (let year = currentYear; year >= startYear; year -= 1) {
      years.push(year);
    }

    return years;
  }, [createdYear, currentYear, selectedYear]);

  useEffect(() => {
    if (!isYearMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!yearMenuRef.current?.contains(event.target as Node)) {
        setIsYearMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsYearMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isYearMenuOpen]);

  async function handleSaveLog(input: { status: HabitLogStatus; note?: string | null }) {
    if (!selectedDate) {
      return;
    }

    try {
      setIsSaving(true);

      // save to backend
      // after a og is saved, refresh streak response
      await saveLog(habit.id, 
        {
        logDate: selectedDate,
        status: input.status,
        note: input.note,
      });
      // Why refresh both? Bcz a save log can affect completion + streak stats
      // Common mistake: call refresh b4 saving log
      await refreshAnalytics();
      setHighlightedDate(input.status === "done" ? selectedDate : null);
      setSelectedDate(null);
    } finally {
      setIsSaving(false);
    }
  }

  function handleSelectYear(nextYear: number) {
    const safeMonthNumber =
      nextYear === currentYear
        ? Math.min(selectedMonthNumber, currentMonthNumber)
        : selectedMonthNumber;

    setMonth(`${nextYear}-${String(safeMonthNumber).padStart(2, "0")}`);
    setIsYearMenuOpen(false);
  }

  return (
    <main className="app-shell min-h-screen px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-[1420px]">
        <section className="app-card overflow-hidden rounded-[42px] border p-5 sm:p-7 lg:p-8">
          <header className="mx-auto grid w-full max-w-3xl justify-items-center gap-3 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--app-secondary)]">
              Habit Tracker
            </p>
            <div className="grid w-full grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-3">
              {onPreviousHabit ? (
                <button
                  aria-label="View previous habit"
                  className="app-soft-control flex h-12 w-12 items-center justify-center rounded-full border text-2xl font-semibold transition hover:brightness-105"
                  onClick={onPreviousHabit}
                  type="button"
                >
                  {"<"}
                </button>
              ) : (
                <span aria-hidden="true" className="block h-12 w-12" />
              )}

              <h1 className="min-w-0 text-4xl font-bold leading-tight text-[var(--app-title)] sm:text-[2.8rem]">
                {habit.name}
              </h1>

              {onNextHabit ? (
                <button
                  aria-label="View next habit"
                  className="app-soft-control flex h-12 w-12 items-center justify-center rounded-full border text-2xl font-semibold transition hover:brightness-105"
                  onClick={onNextHabit}
                  type="button"
                >
                  {">"}
                </button>
              ) : (
                <span aria-hidden="true" className="block h-12 w-12" />
              )}
            </div>
            <button
              className="app-soft-control w-full rounded-2xl border px-5 py-3 text-sm font-semibold transition hover:brightness-105"
              onClick={onClose}
              type="button"
            >
              Back to habits
            </button>
          </header>

          <div className="mt-8 grid gap-5">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.55fr)]">
              <div className="grid gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--app-secondary)]">
                  Daily Log
                </p>
                <h2 className="text-2xl font-bold text-[var(--app-title)]">Monthly Progress</h2>
                <p className="max-w-xl text-sm leading-6 text-[var(--app-muted)]">
                  Click a date to mark it done, missed, or add details.
                </p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.55fr)] xl:items-start">
              <section className="app-card-solid rounded-[32px] border p-5 sm:p-7">
                <div className="app-soft-control relative mb-7 grid w-full grid-cols-[52px_1fr_52px] items-center gap-3 rounded-[22px] border px-3 py-2">
                  <button
                    aria-label="Previous month"
                    className="flex h-12 w-12 items-center justify-center rounded-full text-2xl font-semibold text-[var(--app-soft-text)] transition hover:bg-[var(--app-soft-surface-muted)]"
                    onClick={() => setMonth((currentMonth) => shiftMonth(currentMonth, -1))}
                    type="button"
                  >
                    {"<"}
                  </button>
                  <div className="relative text-center" ref={yearMenuRef}>
                    <button
                      aria-expanded={isYearMenuOpen}
                      aria-haspopup="menu"
                      className="inline-flex items-center justify-center gap-1 rounded-full text-xs font-bold text-[var(--app-soft-muted)] transition hover:text-[var(--app-soft-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
                      onClick={() => setIsYearMenuOpen((currentValue) => !currentValue)}
                      type="button"
                    >
                      <span>{selectedYear}</span>
                      <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <path
                          d="m6 9 6 6 6-6"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                        />
                      </svg>
                    </button>
                    <p className="text-lg font-bold text-[var(--app-soft-text)]">{formatMonthName(month)}</p>

                    {isYearMenuOpen ? (
                      <div
                        className="app-soft-card absolute left-1/2 top-[calc(100%+0.75rem)] z-20 min-w-[120px] -translate-x-1/2 overflow-hidden rounded-2xl border p-2"
                        role="menu"
                      >
                        {yearOptions.map((yearOption) => (
                          <button
                            className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                              yearOption === selectedYear
                                ? "bg-[var(--app-accent-soft)] text-[var(--app-accent-strong)]"
                                : "text-[var(--app-soft-muted)] hover:bg-[var(--app-soft-surface-muted)]"
                            }`}
                            key={yearOption}
                            onClick={() => handleSelectYear(yearOption)}
                            type="button"
                          >
                            {yearOption}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {isCurrentViewedMonth ? (
                    <span aria-hidden="true" className="block h-12 w-12" />
                  ) : (
                    <button
                      aria-label="Next month"
                      className="flex h-12 w-12 items-center justify-center rounded-full text-2xl font-semibold text-[var(--app-soft-text)] transition hover:bg-[var(--app-soft-surface-muted)]"
                      onClick={() => setMonth((currentMonthValue) => shiftMonth(currentMonthValue, 1))}
                      type="button"
                    >
                      {">"}
                    </button>
                  )}
                </div>

                <MonthlyCalendar highlightedDate={highlightedDate} logs={logs} month={month} onSelectDate={setSelectedDate} />
              </section>

              <aside aria-label="Habit statistics" className="grid min-w-0 gap-4">
                <HabitAnalytics
                  completionError={completionError}
                  completionIsLoading={completionIsLoading}
                  lastSevenDays={lastSevenDays}
                  lastThirtyDays={lastThirtyDays}
                  streak={streak}
                  streakError={streakError}
                  streakIsLoading={streakIsLoading}
                />
              </aside>

              {isLoading ? <p className="mt-4 text-sm text-slate-400">Loading logs...</p> : null}
              {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
            </div>
          </div>
        </section>

        {/*HabitDetailPage pass selectedLog (prop) -> LogNoteEditor */}
        {/* In LogNoteEditor , see export ... log on top, means:
        receives the prop*/}

        {/* if selectedDate = null -> Boolean(selectedDate) === false -> isOpen = false (wont open) */}
        <LogNoteEditor
          date={selectedDate}
          isOpen={Boolean(selectedDate)} 
          isSaving={isSaving}
          log={selectedLog}
          onClose={() => setSelectedDate(null)}
          onSave={handleSaveLog}
        />
      </div>
    </main>
  );
}
