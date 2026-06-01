import { useEffect, useState } from "react";
import { LogNoteEditor } from "../habitLogs/components/LogNoteEditor";
import { MonthlyCalendar } from "../habitLogs/components/MonthlyCalendar";
import { StreakStats } from "../habitLogs/components/StreakStats";
import { useHabitLogs } from "../habitLogs/useHabitLogs";
import { useStreak } from "../habitLogs/useStreak";
import type { Habit, HabitLogStatus } from "../../shared/types/api.types";
import { currentMonthString, formatMonthLabel, shiftMonth } from "../../shared/utils/dateUtils";

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
    // creates full screen bg : <main className="min-h-screen bg-[#fafafa]...
    <main className="min-h-screen bg-[#fafafa] px-5 py-5 text-slate-950">
      {/* Card container */}
      <div className="mx-auto w-full max-w-[430px] rounded-[20px] bg-white px-7 py-6 shadow-[0_2px_10px_rgba(15,23,42,0.10)]">
        <header className="mb-8 flex items-start justify-between gap-4">
          {/* Header (Habit name + Close button) */}
          <h1 className="text-xl font-semibold text-slate-950">{habit.name}</h1>
          <button
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>

      {/* Streaks */}
        <StreakStats error={streakError} isLoading={isStreakLoading} streak={streak} />

      {/* Month navigation */}
        <section className="mt-9">
          <div className="mb-6 grid grid-cols-[40px_1fr_40px] items-center">
            {/* (currentMonth, -1) = prev month */}
            <button
              aria-label="Previous month"
              className="text-2xl font-semibold text-slate-700 transition hover:text-slate-950"
              onClick={() => setMonth((currentMonth) => shiftMonth(currentMonth, -1))}
              type="button"
            >
              {"<"}
            </button>
            <h2 className="text-center text-lg font-semibold text-slate-950">{formatMonthLabel(month)}</h2>
            {/* (currentMonth, 1) = Next month */}
            <button
              aria-label="Next month"
              className="text-2xl font-semibold text-slate-700 transition hover:text-slate-950"
              onClick={() => setMonth((currentMonth) => shiftMonth(currentMonth, 1))}
              type="button"
            >
              {">"}
            </button>
          </div>

          {/* Display the calendar circles(dates) */}
          <MonthlyCalendar logs={logs} month={month} onSelectDate={setSelectedDate} />

          {isLoading ? <p className="mt-4 text-sm text-slate-400">Loading logs...</p> : null}
          {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
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
