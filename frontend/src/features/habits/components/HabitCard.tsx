// each habit card

import { type FormEvent, useMemo, useState } from "react";
import type { Habit, HabitLogStatus } from "../../../shared/types/api.types";
import {
  currentMonthString,
  getRecentSevenDays,
} from "../../../shared/utils/dateUtils";
import { LogNoteEditor } from "../../habitLogs/components/LogNoteEditor";
import { StreakDotsRow } from "../../habitLogs/components/StreakDotsRow";
import { useHabitLogs } from "../../habitLogs/useHabitLogs";

// props AKA what the card receives 
// parameters passed into a component
// parent component receives them
// child shud not directly change them (jz like function para)
export type HabitCardProps = {
  // ONE habit object
  habit: Habit;

  // actions
  onViewHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => Promise<void>;
  onUpdateHabit: (habitId: string, name: string) => Promise<void>; // receives HabitId, takes time (call backend) + returns ntg
  onMoveHabitUp: (habitId: string) => void;// returns ntg too, but does not call backend
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
  onUpdateHabit,
  onMoveHabitUp,
  onMoveHabitDown,
  canMoveUp,
  canMoveDown,
}: HabitCardProps) {// deconstruction

  // get recent 7 days & get current month
  // load logs for this habit + month
  // useMemo = remember(caches) calculated value -> x recalculate
  const weekDates = useMemo(() => getRecentSevenDays(), []);
  const month = currentMonthString();
  const { logs, isLoading, error, saveLog } = useHabitLogs(habit.id, month);

  // which circle/date clicked
  // currently saving log?
  // three-dot menu open?
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(habit.name);
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

  async function handleUpdateName(event: FormEvent<HTMLFormElement>) {
    // stop page refresh
    event.preventDefault();

    const name = draftName.trim();

    // if empty name || same name -> return
    // skip unnecessary work
    if (!name || name === habit.name) {
      setDraftName(habit.name);
      setIsEditingName(false);// UI show : Saving...
      return;
    }

    try {
      setIsSavingName(true);

      // call backend 
      await onUpdateHabit(habit.id, name);
      // leave edit mode -> input disappears, new name displayed
      setIsEditingName(false);
    } catch {
      // The habits hook owns the visible error message.
    } finally {
      setIsSavingName(false);
    }
  }

  async function handleDeleteHabit() {
    try {
      setIsDeleting(true);

      // call backend 
      await onDeleteHabit(habit.id);
    } catch {
      // The habits hook owns the visible error message.
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article className="relative rounded-[22px] bg-white px-5 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.12)]">
      <div className="mb-7 flex items-start justify-between gap-4">
        {isEditingName ? (
          <form className="grid flex-1 gap-2" onSubmit={handleUpdateName}>
            <input
              aria-label="Habit name"
              className="h-9 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-950 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              disabled={isSavingName}
              onChange={(event) => setDraftName(event.target.value)}
              value={draftName}
            />
            <div className="flex gap-2">
              <button
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                disabled={isSavingName}
                type="submit"
              >
                Save
              </button>
              <button
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                disabled={isSavingName}
                onClick={() => {
                  setDraftName(habit.name);
                  setIsEditingName(false);
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <h2 className="text-[15px] font-semibold text-slate-950">{habit.name}</h2>
        )}
        <div className="flex items-start gap-3">
          <button
            className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 transition hover:bg-emerald-100 hover:text-emerald-700"
            onClick={() => onViewHabit(habit.id)}
            type="button"
          >
            View
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
            className="block w-full px-3 py-2 text-left text-slate-600 hover:bg-slate-50"
            onClick={() => {
              setDraftName(habit.name);
              setIsEditingName(true);
              setIsMenuOpen(false);
            }}
            type="button"
          >
            Edit name
          </button>
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
          {/* when deletion is happeing, isDeleting = true 
              
          button disabled to prevent: delete delete delete delete
          */}
          <button
            className="block w-full px-3 py-2 text-left text-red-500 hover:bg-red-50"
            disabled={isDeleting}
            onClick={() => {
              void handleDeleteHabit();
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
