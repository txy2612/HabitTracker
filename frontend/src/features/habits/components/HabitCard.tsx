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

// props AKA what the card receives 
// parameters passed into a component
// parent component receives them
// child shud not directly change them (jz like function para)
export type HabitCardProps = {
  // ONE habit object
  habit: Habit;

  // actions
  onViewHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onMoveHabitUp: (habitId: string) => void;
  onMoveHabitDown: (habitId: string) => void;

  //whether move buttons shud be enabled
  canMoveUp: boolean;
  canMoveDown: boolean;
};

// equi:
// export function HabitCard(props: HabitCardProps){}
export function HabitCard({
  habit,
  onViewHabit,
  onDeleteHabit,
  onMoveHabitUp,
  onMoveHabitDown,
  canMoveUp,
  canMoveDown,
}: HabitCardProps) {// deconstruction

  // get recent 7 days & get current month
  // load logs for this habit + month
  const weekDates = useMemo(() => getRecentSevenDays(), []);
  const month = currentMonthString();
  const { logs, isLoading, error, saveLog } = useHabitLogs(habit.id, month);

  // which circle/date clicked
  // currently saving log?
  // three-dot menu open?
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // find selected log
  // if no log exist for that date -> undefined
  const selectedLog = selectedDate
    ? logs.find((log) => log.logDate === selectedDate)
    : undefined;

  async function handleSave(input: { status: HabitLogStatus; note?: string | null }) {

    // guard: no selected date -> stop immediately
    if (!selectedDate) {
      return;
    }

    try {
      setIsSaving(true);

      // save to backend
      await saveLog(habit.id, 
        {
        logDate: selectedDate,// 2026-05-01
        status: input.status,//etc: done
        note: input.note,// etc: 5km
      });

      setSelectedDate(null);// user fin editing, close popup
    } finally {
      // regardless save succeeds/fails
      // finally will execute this -> X stuck in 'Saving... ' forever
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

      {/* only shows if isMenuOpen is true */}
      {/* buttons call parent functions:            onMoveHabitUp(habit.id)
        onMoveHabitDown(habit.id)
        onDeleteHabit(habit.id)
      */}
      {/* these come from [arents, HabitCard X decide how they work] */}
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

      {/* StreakDotsRow displays dots
        When dot clicked, it calls setSelectedDate(date)
        Then LogNoteEditor opens */}
      <StreakDotsRow dates={weekDates} logs={logs} onSelectDate={setSelectedDate} />

      {isLoading ? <p className="mt-3 text-xs text-slate-400">Loading logs...</p> : null}
      {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}

        {/* onClose={() => ... creates a tiny function 
        
        LogNoteEditor calls props.onClose*/}
        {/* HabitCard = parent , LogEditor = child */}
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
