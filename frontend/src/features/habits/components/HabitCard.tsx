// each habit card

import { useMemo, useState } from "react";
import type { Habit, HabitLogStatus } from "../../../shared/types/api.types";
import {
  currentMonthString,
  getRecentSevenDays,
} from "../../../shared/utils/dateUtils";
import { LogNoteEditor } from "../../habitLogs/components/LogNoteEditor";
import { StreakDotsRow } from "../../habitLogs/components/StreakDotsRow";
import { useHabitLogs } from "../../habitLogs/hooks/useHabitLogs";

export type HabitCardProps = {
  habit: Habit;
  onViewHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onMoveHabitUp: (habitId: string) => void;
  onMoveHabitDown: (habitId: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function HabitCard({
  habit,
  onViewHabit,
  onDeleteHabit,
  onMoveHabitUp,
  onMoveHabitDown,
  canMoveUp,
  canMoveDown,
}: HabitCardProps) {
  const weekDates = useMemo(() => getRecentSevenDays(), []);
  const month = currentMonthString();
  const { logs, isLoading, error, saveLog } = useHabitLogs(habit.id, month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const selectedLog = selectedDate
    ? logs.find((log) => log.logDate === selectedDate)
    : undefined;

  async function handleSave(input: { status: HabitLogStatus; note?: string | null }) {
    if (!selectedDate) {
      return;
    }

    try {
      setIsSaving(true);
      await saveLog(habit.id, {
        logDate: selectedDate,
        status: input.status,
        note: input.note,
      });
      setSelectedDate(null);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="relative rounded-[22px] bg-white px-5 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.12)]">
      <div className="mb-7 flex items-start justify-between gap-4">
        <h2 className="text-[15px] font-semibold text-slate-950">{habit.name}</h2>
        <div className="flex items-start gap-3">
          <button
            className="text-[10px] font-semibold text-[#9ca3af] transition hover:text-slate-600"
            onClick={() => onViewHabit(habit.id)}
            type="button"
          >
            view
          </button>
          <button
            aria-label={`Open menu for ${habit.name}`}
            className="-mt-1 rounded-full px-1 text-lg leading-none text-[#9ca3af] transition hover:text-slate-700"
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
            type="button"
          >
            ...
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="absolute right-5 top-11 z-10 w-36 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 text-sm shadow-lg">
          <button
            className="block w-full px-3 py-2 text-left text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
            disabled={!canMoveUp}
            onClick={() => {
              onMoveHabitUp(habit.id);
              setIsMenuOpen(false);
            }}
            type="button"
          >
            Move up
          </button>
          <button
            className="block w-full px-3 py-2 text-left text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
            disabled={!canMoveDown}
            onClick={() => {
              onMoveHabitDown(habit.id);
              setIsMenuOpen(false);
            }}
            type="button"
          >
            Move down
          </button>
          <button
            className="block w-full px-3 py-2 text-left text-red-500 hover:bg-red-50"
            onClick={() => {
              onDeleteHabit(habit.id);
              setIsMenuOpen(false);
            }}
            type="button"
          >
            Delete habit
          </button>
        </div>
      ) : null}

      <StreakDotsRow dates={weekDates} logs={logs} onSelectDate={setSelectedDate} />

      {isLoading ? <p className="mt-3 text-xs text-slate-400">Loading logs...</p> : null}
      {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}

      <LogNoteEditor
        date={selectedDate}
        isOpen={Boolean(selectedDate)}
        isSaving={isSaving}
        log={selectedLog}
        onClose={() => setSelectedDate(null)}
        onSave={handleSave}
      />
    </article>
  );
}
