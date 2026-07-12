// each habit card

import { type FormEvent, type KeyboardEvent, useMemo, useState } from "react";
import type { Habit, HabitLogStatus } from "../../../shared/types/api.types";
import {
  currentMonthString,
  getRecentSevenDays,
} from "../../../shared/utils/dateUtils";
import { LogNoteEditor } from "../../habitLogs/components/LogNoteEditor";
import { StreakDotsRow } from "../../habitLogs/components/StreakDotsRow";
import { useHabitLogs } from "../../habitLogs/hooks/useHabitLogs";
import { formatReminderCardSummary } from "../../reminders/reminderSummary";

// props AKA what the card receives 
// parameters passed into a component
// parent component receives them
// child shud not directly change them (jz like function para)
export type HabitCardProps = {
  // ONE habit object
  habit: Habit;

  // actions
  onViewHabit: (habitId: string) => void;

  // when it touches repo -> DB -> likely a Promise (takes time)
  onArchiveHabit: (habitId: string) => Promise<void>;
  onDeleteHabit: (habitId: string) => Promise<void>;
  onUpdateHabit: (habitId: string, name: string) => Promise<void>; // receives HabitId, takes time (call backend) + returns ntg
  onEditReminder: (habitId: string) => void;
};

// equi:
// export function HabitCard(props: HabitCardProps){}
export function HabitCard({
  habit,
  onViewHabit,
  onArchiveHabit,
  onDeleteHabit,
  onUpdateHabit,
  onEditReminder,
}: HabitCardProps) {// deconstruction

  // get recent 7 days & get current month
  // load logs for this habit + month
  // useMemo = remember(caches) calculated value -> x recalculate
  const weekDates = useMemo(() => getRecentSevenDays(), []);
  const month = currentMonthString();
  const { logs, isLoading, error, saveLog } = useHabitLogs(habit.id, month);

  // three-dot menu open?
  const [isSavingName, setIsSavingName] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(habit.name);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSavingLog, setIsSavingLog] = useState(false);
  const selectedLog = useMemo(
    () => logs.find((log) => log.logDate === selectedDate),
    [logs, selectedDate],
  );

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

  async function handleArchiveHabit() {
    try {
      setIsArchiving(true);
      await onArchiveHabit(habit.id);
    } catch {
      // The habits hook owns the visible error message.
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleSaveLog(input: { status: HabitLogStatus; note?: string | null }) {
    if (!selectedDate) {
      return;
    }

    try {
      setIsSavingLog(true);
      await saveLog(habit.id, {
        logDate: selectedDate,
        note: input.note,
        status: input.status,
      });
      setSelectedDate(null);
    } finally {
      setIsSavingLog(false);
    }
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onViewHabit(habit.id);
    }
  }

  return (
    <article
      aria-label={`Open monthly view for ${habit.name}`}
      className="relative cursor-pointer rounded-[22px] bg-white px-5 py-6 shadow-[0_2px_10px_rgba(15,23,42,0.12)] transition hover:shadow-[0_4px_14px_rgba(15,23,42,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      onClick={() => onViewHabit(habit.id)}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        {isEditingName ? (
          <form className="grid flex-1 gap-2" onClick={(event) => event.stopPropagation()} onSubmit={handleUpdateName}>
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
            aria-label={`Open menu for ${habit.name}`}
            className="-mt-1 rounded-full px-1 text-lg leading-none text-[#9ca3af] transition hover:text-slate-700"
            onClick={(event) => {
              event.stopPropagation();
              setIsMenuOpen((currentValue) => !currentValue);
            }}
            type="button"
          >
            ...
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div
          className="absolute right-5 top-11 z-10 w-40 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 text-sm shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
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
            className="block w-full px-3 py-2 text-left text-amber-700 hover:bg-amber-50 disabled:text-amber-400"
            disabled={isArchiving}
            onClick={() => {
              void handleArchiveHabit();
              setIsMenuOpen(false);
            }}
            type="button"
          >
            {isArchiving ? "Archiving..." : "Archive habit"}
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

      <div className="grid gap-3">
        <button
          aria-label={`Edit reminder for ${habit.name}`}
          className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-left text-sm transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          onClick={(event) => {
            event.stopPropagation();
            onEditReminder(habit.id);
          }}
          type="button"
        >
          <span className="font-medium text-slate-500">Reminder:</span>
          <span className="truncate pl-3 text-right text-slate-700">{formatReminderCardSummary({
            reminderEnabled: habit.reminderEnabled,
            reminderTime: habit.reminderTime,
            scheduleType: habit.reminderScheduleType,
            weekdays: habit.reminderWeekdays,
            specificDate: habit.reminderSpecificDate,
          })}</span>
        </button>

        <StreakDotsRow dates={weekDates} logs={logs} onSelectDate={setSelectedDate} />
      </div>

      {isLoading ? <p className="mt-3 text-xs text-slate-400">Loading logs...</p> : null}
      {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}

      <LogNoteEditor
        date={selectedDate}
        isOpen={Boolean(selectedDate)}
        isSaving={isSavingLog}
        log={selectedLog}
        onClose={() => setSelectedDate(null)}
        onSave={handleSaveLog}
      />
    </article>
  );
}
