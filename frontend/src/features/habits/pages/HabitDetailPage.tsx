import { useEffect, useMemo, useRef, useState } from "react";
import { LogNoteEditor } from "../../habitLogs/components/LogNoteEditor";
import { MonthlyCalendar } from "../../habitLogs/components/MonthlyCalendar";
import { StreakStats } from "../../habitLogs/components/StreakStats";
import { useHabitLogs } from "../../habitLogs/hooks/useHabitLogs";
import { useStreak } from "../../habitLogs/hooks/useStreak";
import type { Habit, HabitLogStatus } from "../../../shared/types/api.types";
import { currentMonthString, formatMonthName, shiftMonth } from "../../../shared/utils/dateUtils";

// this component receive these props
// in React, page IS a component
// how to know parent? -> serach project-wide for <HabitDetailPage OR HabitDetailPage(
export type HabitDetailPageProps = {
  habit: Habit;// the habit being viewed
  onClose: () => void;// the function used when user clicks Close
};

export function HabitDetailPage({ habit, onClose }: HabitDetailPageProps) {
  const yearMenuRef = useRef<HTMLDivElement | null>(null);
  const [month, setMonth] = useState(currentMonthString());// stores the current viewed month
  const [selectedDate, setSelectedDate] = useState<string | null>(null);// stores the date user clicked -> controls whether the modal popup/close
  const [highlightedDate, setHighlightedDate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const { logs, isLoading, error, saveLog } = useHabitLogs(habit.id, month);
  const {
    streak,
    isLoading: isStreakLoading,
    error: streakError,
    fetchStreak,
  } = useStreak(); // the hook that handle streak data
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
    void fetchStreak(habit.id);
  }, [fetchStreak, habit.id]);

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
      await saveLog(habit.id, 
        {
        logDate: selectedDate,
        status: input.status,
        note: input.note,
      });
      await fetchStreak(habit.id);
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
          <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.35fr)] lg:items-end">
            <header className="grid gap-4">
              <div className="grid gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--app-secondary)]">
                  Habit Tracker
                </p>
                <h1 className="text-4xl font-bold leading-tight text-[var(--app-title)] sm:text-[2.8rem]">
                  {habit.name}
                </h1>
                <p className="max-w-xl text-base leading-7 text-[var(--app-muted)]">
                  Review progress and update daily results.
                </p>
              </div>

              <button
                className="app-soft-control w-full max-w-sm rounded-2xl border px-5 py-3 text-sm font-semibold transition hover:brightness-105"
                onClick={onClose}
                type="button"
              >
                Back to habits
              </button>
            </header>

            <StreakStats error={streakError} isLoading={isStreakLoading} streak={streak} />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.55fr)] xl:items-start">
            <section className="grid gap-5">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-center">
                <div className="grid gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--app-secondary)]">
                    Daily Log
                  </p>
                  <h2 className="text-2xl font-bold text-[var(--app-title)]">Monthly Progress</h2>
                  <p className="max-w-xl text-sm leading-6 text-[var(--app-muted)]">
                    Click a date to mark it done, missed, or add details.
                  </p>
                </div>

                <div className="app-soft-control grid grid-cols-[52px_1fr_52px] items-center gap-3 rounded-[22px] border px-3 py-2">
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
              </div>

              <section className="app-card-solid rounded-[32px] border p-5 sm:p-7">
                <div className="mb-7 flex flex-col gap-3 border-b border-[var(--app-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-[var(--app-muted)]">Calendar</p>
                  <p className="text-sm font-medium text-[var(--app-muted)]">Colored dates are completed days.</p>
                </div>

                <MonthlyCalendar highlightedDate={highlightedDate} logs={logs} month={month} onSelectDate={setSelectedDate} />
              </section>
            </section>

            <aside className="app-card-solid rounded-[30px] border p-5 xl:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--app-secondary)]">
                Insights
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--app-title)]">Progress Lens</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">
                Cool colors mean steady progress. Warm colors mean stronger streak momentum.
              </p>
              <div className="mt-5 overflow-hidden rounded-[26px] border border-[var(--app-border)] bg-[var(--app-palette-card)] p-5">
                <div className="mx-auto grid h-64 max-h-[58vw] min-h-52 w-full max-w-72 place-items-center rounded-[30px] bg-[radial-gradient(circle_at_50%_50%,var(--app-palette-card)_0_20%,transparent_21%),conic-gradient(from_150deg,var(--app-calendar-done-3),var(--app-calendar-done-4),var(--app-calendar-done-1),var(--app-calendar-done-5),var(--app-calendar-done-3))] shadow-[0_0_46px_color-mix(in_srgb,var(--app-calendar-done-3)_34%,transparent)]">
                  <div className="h-16 w-16 rounded-full border-[10px] border-[var(--app-modal-surface)] bg-[var(--app-palette-card)] shadow-inner" />
                </div>
              </div>
            </aside>

            {isLoading ? <p className="mt-4 text-sm text-slate-400">Loading logs...</p> : null}
            {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
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
