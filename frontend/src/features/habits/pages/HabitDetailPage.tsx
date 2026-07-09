import { useEffect, useState } from "react";
import { LogNoteEditor } from "../../habitLogs/components/LogNoteEditor";
import { MonthlyCalendar } from "../../habitLogs/components/MonthlyCalendar";
import { StreakStats } from "../../habitLogs/components/StreakStats";
import { useHabitLogs } from "../../habitLogs/hooks/useHabitLogs";
import { useStreak } from "../../habitLogs/hooks/useStreak";
import type { Habit, HabitLogStatus } from "../../../shared/types/api.types";
import { currentMonthString, formatMonthLabel, shiftMonth } from "../../../shared/utils/dateUtils";

// this component receive these props
// in React, page IS a component
// how to know parent? -> serach project-wide for <HabitDetailPage OR HabitDetailPage(
export type HabitDetailPageProps = {
  habit: Habit;// the habit being viewed
  onClose: () => void;// the function used when user clicks Close
};

export function HabitDetailPage({ habit, onClose }: HabitDetailPageProps) {
  const [month, setMonth] = useState(currentMonthString());// stores the current viewed month
  const [selectedDate, setSelectedDate] = useState<string | null>(null);// stores the date user clicked -> controls whether the modal popup/close
  const [isSaving, setIsSaving] = useState(false);
  const { logs, isLoading, error, saveLog } = useHabitLogs(habit.id, month);
  const {
    streak,
    isLoading: isStreakLoading,
    error: streakError,
    fetchStreak,
  } = useStreak(); // the hook that handle streak data
  const selectedLog = selectedDate ? logs.find((log) => log.logDate === selectedDate) : undefined;// if a date selected -> find the log for that date, if found, pass to LogNoteEditor (bottom of this file)

  useEffect(() => {
    void fetchStreak(habit.id);
  }, [fetchStreak, habit.id]);

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
      setSelectedDate(null);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f2] px-6 py-8 text-slate-950 lg:px-10">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-8 xl:self-start">
            <div className="rounded-[28px] border border-[#e8e6dc] bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
              <header className="mb-6 grid gap-4 border-b border-slate-100 pb-6">
                <div className="grid gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Habit detail</p>
                  <h1 className="text-3xl font-semibold text-slate-950">{habit.name}</h1>
                  <p className="text-sm leading-6 text-slate-500">
                    Review streak progress and update daily results from a full calendar workspace.
                  </p>
                </div>
                <button
                  className="self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  onClick={onClose}
                  type="button"
                >
                  Back to habits
                </button>
              </header>

              <StreakStats error={streakError} isLoading={isStreakLoading} streak={streak} />
            </div>
          </aside>

          <section className="rounded-[28px] border border-[#e8e6dc] bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Monthly timeline</p>
                <h2 className="text-2xl font-semibold text-slate-950">{formatMonthLabel(month)}</h2>
              </div>

              <div className="grid grid-cols-[52px_1fr_52px] items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2 lg:min-w-[260px]">
                <button
                  aria-label="Previous month"
                  className="flex h-12 w-12 items-center justify-center rounded-full text-2xl font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                  onClick={() => setMonth((currentMonth) => shiftMonth(currentMonth, -1))}
                  type="button"
                >
                  {"<"}
                </button>
                <p className="text-center text-sm font-semibold text-slate-700">Jump month</p>
                <button
                  aria-label="Next month"
                  className="flex h-12 w-12 items-center justify-center rounded-full text-2xl font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                  onClick={() => setMonth((currentMonth) => shiftMonth(currentMonth, 1))}
                  type="button"
                >
                  {">"}
                </button>
              </div>
            </div>

            <MonthlyCalendar logs={logs} month={month} onSelectDate={setSelectedDate} />

            {isLoading ? <p className="mt-4 text-sm text-slate-400">Loading logs...</p> : null}
            {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
          </section>
        </div>

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
