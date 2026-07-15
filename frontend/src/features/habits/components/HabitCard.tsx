// each habit card

import { type CSSProperties, type FormEvent, type KeyboardEvent, useMemo, useState } from "react";
import type { Habit, HabitLog, HabitLogStatus } from "../../../shared/types/api.types";
import {
  currentMonthString,
  formatRecentDayLabel,
  getDayNumber,
  getRecentSevenDays,
  todayString,
} from "../../../shared/utils/dateUtils";
import { LogNoteEditor } from "./LogNoteEditor";
import { useHabitLogs } from "../hooks/useHabitLogs";
import {
  formatReminderCardSummary,
  hasSavedReminderSettings,
} from "../../reminders/reminderSummary";
import { ConfirmationModal } from "../../../shared/components/ConfirmationModal";

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

type StreakDotsRowProps = {
  dates: string[];
  logs: HabitLog[];
  onSelectDate?: (date: string) => void;
};

function getLogForDate(logs: HabitLog[], date: string) {
  return logs.find((log) => log.logDate === date);
}

const doneCircleClasses = [
  "bg-[var(--app-calendar-done-1)] text-white",
  "bg-[var(--app-calendar-done-2)] text-white",
  "bg-[var(--app-calendar-done-3)] text-white",
  "bg-[var(--app-calendar-done-4)] text-white",
  "bg-[var(--app-calendar-done-5)] text-white",
];

function getDoneCircleClasses(date: string) {
  const dayNumber = Number(date.slice(-2));
  return doneCircleClasses[dayNumber % doneCircleClasses.length];
}

function getDoneColorIndex(date: string) {
  const dayNumber = Number(date.slice(-2));
  return (dayNumber % doneCircleClasses.length) + 1;
}

function getDoneConnectorStyle(leftDate: string, rightDate: string): CSSProperties {
  const leftColor = `var(--app-calendar-line-${getDoneColorIndex(leftDate)})`;
  const rightColor = `var(--app-calendar-line-${getDoneColorIndex(rightDate)})`;

  return {
    background: `linear-gradient(90deg, ${leftColor}, ${rightColor})`,
  };
}

function getCircleClasses(date: string, log?: HabitLog) {
  const today = todayString();
  const isToday = date === today;

  if (date > today) {
    return "cursor-not-allowed bg-[var(--app-control-surface)] text-[var(--app-muted)] opacity-50";
  }

  if (log?.status === "done") {
    return getDoneCircleClasses(date);
  }

  if (log?.status === "missed") {
    return "bg-[var(--app-calendar-missed)] text-[var(--app-calendar-missed-text)]";
  }

  return isToday
    ? "bg-[var(--app-calendar-missed)] text-[var(--app-calendar-missed-text)]"
    : "bg-[var(--app-calendar-idle)] text-[var(--app-calendar-idle-text)]";
}

function getConnectorStyle(leftDate: string, rightDate: string, leftLog?: HabitLog, rightLog?: HabitLog) {
  const today = todayString();

  if (leftDate > today || rightDate > today || !leftLog || !rightLog) {
    return undefined;
  }

  return leftLog.status === "done" && rightLog.status === "done"
    ? getDoneConnectorStyle(leftDate, rightDate)
    : undefined;
}

function StreakDotsRow({ dates, logs, onSelectDate }: StreakDotsRowProps) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-max">
        <div className="mb-2 flex items-center">
          {dates.map((date, index) => (
            <div className="flex items-center" key={`label-${date}`}>
              <span className="block w-10 text-center text-[10px] font-medium text-[var(--app-muted)]">
                {formatRecentDayLabel(date)}
              </span>
              {index < dates.length - 1 ? <span className="w-3 shrink-0" aria-hidden="true" /> : null}
            </div>
          ))}
        </div>

        <div className="flex items-center">
          {dates.map((date, index) => {
            const isFutureDate = date > todayString();
            const log = getLogForDate(logs, date);
            const nextDate = dates[index + 1];
            const nextLog = nextDate ? getLogForDate(logs, nextDate) : undefined;
            const connectorStyle = nextDate ? getConnectorStyle(date, nextDate, log, nextLog) : undefined;

            return (
              <div className="flex items-center" key={date}>
                <button
                  aria-label={`Edit log for ${date}`}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold transition focus:outline-none ${
                    isFutureDate ? "" : "hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] focus-visible:ring-offset-2"
                  } ${getCircleClasses(date, log)}`}
                  disabled={isFutureDate}
                  onClick={(event) => {
                    event.stopPropagation();

                    if (!isFutureDate) {
                      onSelectDate?.(date);
                    }
                  }}
                  type="button"
                >
                  {getDayNumber(date)}
                </button>

                {index < dates.length - 1 ? (
                  <span
                    className={`h-0.5 w-3 shrink-0 ${connectorStyle ? "" : "bg-transparent"}`}
                    style={connectorStyle}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CardIcon({ type }: { type: "archive" | "clock" | "edit" | "trash" }) {
  const paths = {
    archive:
      "M4.5 7.5h15m-13 0V18A2.5 2.5 0 0 0 9 20.5h6A2.5 2.5 0 0 0 17.5 18V7.5M8 7.5V5.75A2.25 2.25 0 0 1 10.25 3.5h3.5A2.25 2.25 0 0 1 16 5.75V7.5M10 12h4",
    clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    edit:
      "m5 18.5 4.1-.8 9.2-9.2a2.1 2.1 0 0 0-3-3L6.1 14.7 5 18.5ZM13.5 6.5l4 4",
    trash:
      "M4.5 7h15M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m2.5 0-.7 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6.5 7M10 11v5m4-5v5",
  };

  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
      <path
        d={paths[type]}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

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
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSavingLog, setIsSavingLog] = useState(false);
  const selectedLog = useMemo(
    () => logs.find((log) => log.logDate === selectedDate),
    [logs, selectedDate],
  );
  const recentLogs = useMemo(
    () => weekDates.map((date) => logs.find((log) => log.logDate === date)),
    [logs, weekDates],
  );
  const completedCount = recentLogs.filter((log) => log?.status === "done").length;
  const missedCount = recentLogs.filter((log) => log?.status === "missed").length;
  const reminderHasSavedSettings = hasSavedReminderSettings({
    reminderTime: habit.reminderTime,
    scheduleType: habit.reminderScheduleType,
    weekdays: habit.reminderWeekdays,
    specificDate: habit.reminderSpecificDate,
  });
  const reminderStateLabel = habit.reminderEnabled ? "Active" : reminderHasSavedSettings ? "Paused" : "Off";
  const reminderStateClasses = habit.reminderEnabled
    ? "bg-[var(--app-accent-soft)] text-[var(--app-accent-strong)]"
    : reminderHasSavedSettings
      ? "bg-[var(--app-warm-soft)] text-[var(--app-warm)]"
      : "bg-[var(--app-control-surface)] text-[var(--app-muted)]";

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
      setIsDeleteConfirmOpen(false);
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
      className="app-card-solid relative cursor-pointer rounded-[22px] border px-5 py-6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_42px_var(--app-shadow)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] focus-visible:ring-offset-2"
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
              className="h-9 rounded-md border border-[var(--app-border)] bg-[var(--app-modal-surface)] px-3 text-sm font-semibold text-[var(--app-text)] outline-none focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent-soft)]"
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
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-[var(--app-muted)] hover:bg-[var(--app-control-surface)]"
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
          <div className="grid gap-1">
            <h2 className="text-xl font-bold leading-tight text-[var(--app-text)]">{habit.name}</h2>
            <p className="text-xs font-medium text-[var(--app-muted)]">
              Past 7 days: {completedCount} done
              {missedCount > 0 ? `, ${missedCount} missed` : ""}
            </p>
          </div>
        )}
        <div className="flex items-start gap-3">
          <button
            aria-label={`Open menu for ${habit.name}`}
            className="-mr-1 -mt-1 flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-[#9ca3af] transition hover:bg-[var(--app-control-surface)] hover:text-[var(--app-text)]"
            onClick={(event) => {
              event.stopPropagation();
              setIsMenuOpen((currentValue) => !currentValue);
            }}
            type="button"
          >
            <span aria-hidden="true">...</span>
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div
          className="app-solid-surface absolute right-5 top-11 z-10 w-40 overflow-hidden rounded-xl border py-1 text-sm shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[var(--app-text)] hover:bg-[var(--app-control-surface)]"
            onClick={() => {
              setDraftName(habit.name);
              setIsEditingName(true);
              setIsMenuOpen(false);
            }}
            type="button"
          >
            <CardIcon type="edit" />
            Edit name
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-amber-700 hover:bg-amber-50 disabled:text-amber-400"
            disabled={isArchiving}
            onClick={() => {
              void handleArchiveHabit();
              setIsMenuOpen(false);
            }}
            type="button"
          >
            <CardIcon type="archive" />
            {isArchiving ? "Archiving..." : "Archive habit"}
          </button>
          
          {/* when deletion is happeing, isDeleting = true 
              
          button disabled to prevent: delete delete delete delete
          */}
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-500 hover:bg-red-50"
            disabled={isDeleting}
            onClick={() => {
              setIsMenuOpen(false);
              setIsDeleteConfirmOpen(true);
            }}
            type="button"
          >
            <CardIcon type="trash" />
            Delete habit
          </button>
        </div>
      ) : null}

      <div className="grid gap-3">
        <button
          aria-label={`Edit reminder for ${habit.name}`}
          className="grid w-full gap-2 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-control-surface)] px-4 py-3.5 text-left text-sm shadow-[inset_0_1px_0_color-mix(in_srgb,var(--app-text)_8%,transparent)] transition hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] focus-visible:ring-offset-2 sm:grid-cols-[auto_1fr_auto] sm:items-center"
          onClick={(event) => {
            event.stopPropagation();
            onEditReminder(habit.id);
          }}
          type="button"
        >
          <span className="inline-flex items-center gap-2 font-semibold text-[var(--app-secondary)]">
            <CardIcon type="clock" />
            Reminder
          </span>
          <span className="min-w-0 font-semibold text-[var(--app-text)] sm:truncate sm:text-right">{formatReminderCardSummary({
            reminderEnabled: habit.reminderEnabled,
            reminderTime: habit.reminderTime,
            scheduleType: habit.reminderScheduleType,
            weekdays: habit.reminderWeekdays,
            specificDate: habit.reminderSpecificDate,
          })}</span>
          {reminderStateLabel !== "Off" ? (
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${reminderStateClasses}`}>
              {reminderStateLabel}
            </span>
          ) : null}
        </button>

        <StreakDotsRow dates={weekDates} logs={logs} onSelectDate={setSelectedDate} />
        <p className="text-xs leading-5 text-[var(--app-muted)]">Click any date to mark it done, missed, or add details.</p>
      </div>

      {isLoading ? (
        <div className="mt-3 h-3 w-28 animate-pulse rounded-full bg-slate-100" aria-label="Loading logs" />
      ) : null}
      {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}

      <ConfirmationModal
        confirmLabel="Delete habit"
        description={`Delete "${habit.name}" permanently? This removes it from your habits and cannot be undone.`}
        isConfirming={isDeleting}
        isOpen={isDeleteConfirmOpen}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => void handleDeleteHabit()}
        title="Delete this habit?"
        tone="danger"
      />

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
