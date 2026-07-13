import { useEffect } from "react";
import type { Habit, ReminderScheduleType, ReminderWeekday } from "../../shared/types/api.types";
import { Button } from "../../shared/components/Button";
import { EmptyState } from "../../shared/components/EmptyState";
import { useReminders, type ReminderDraft } from "./useReminders";
import { formatReminderSchedule } from "./reminderSummary";
import { ReminderToggle } from "./components/ReminderToggle";

/*ReminderSettingsPage.tsx = UI / screen

  1.expects props from parent:
    habits, isLoading, error, onClose, onSaved

  2.receives them
  3.gives habits into the hook
    const reminders = useReminders(habits);
  4.use hook data/functions to render UI and handles clicks/typing
*/

// 1. expect
export type ReminderSettingsPageProps = {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  focusedHabitId?: string | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const scheduleOptions: { value: ReminderScheduleType; label: string }[] = [
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Days of week" },
  { value: "specific_date", label: "Specific date" },
];

const weekdayOptions: { value: ReminderWeekday; label: string }[] = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

function formatReminderSummary(habit: ReminderDraft) {
  return formatReminderSchedule(habit);
}

function ReminderPageSkeleton() {
  return (
    <div className="grid gap-5" aria-label="Loading reminder settings">
      {[0, 1, 2].map((item) => (
        <div
          className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_16px_35px_rgba(15,23,42,0.06)]"
          key={item}
        >
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="grid flex-1 gap-3">
              <div className="h-5 w-44 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-64 max-w-full animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="h-10 w-[4.5rem] animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusNotice({
  tone,
  title,
  children,
}: {
  tone: "error" | "success";
  title: string;
  children: string;
}) {
  const styles =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-800"
      : "border-red-100 bg-red-50 text-red-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 opacity-90">{children}</p>
    </div>
  );
}

export function ReminderSettingsPage({
  habits,
  isLoading,
  error,
  focusedHabitId = null,
  onClose,
  onSaved,
}: ReminderSettingsPageProps) {
  const reminders = useReminders(habits);// custom hook (starts with 'use')

  useEffect(() => {
    if (!focusedHabitId) {
      return;
    }

    const target = document.getElementById(`reminder-habit-${focusedHabitId}`);

    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusedHabitId, reminders.drafts]);

  async function handleSave() {
    try {
      await reminders.saveReminders();
      await onSaved();
    } catch {
      // useReminders already sets the visible error message.
    }
  }

  // 3. use prop values
  return (
    <main className="min-h-screen bg-[#f7f7f2] px-6 py-8 text-slate-950 lg:px-10">
      <div className="mx-auto w-full max-w-[1440px]">
        <header className="mb-8 flex flex-col gap-5 border-b border-[#e8e6dc] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Reminder Studio</p>
            <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">Habit Reminders</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Choose when each habit should nudge you. Turning a reminder off pauses it, but keeps the saved schedule ready
              for later.
            </p>
          </div>
          <button
            className="self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            Back to dashboard
          </button>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="grid gap-5">
            {isLoading ? <ReminderPageSkeleton /> : null}

            {error ? (
              <StatusNotice title="Could not load habits" tone="error">
                {error}
              </StatusNotice>
            ) : null}

            {reminders.error ? (
              <StatusNotice title="Could not save reminders" tone="error">
                {reminders.error}
              </StatusNotice>
            ) : null}

            {!isLoading && !error && reminders.drafts.length === 0 ? (
              <EmptyState title="No habits to remind you about yet">
                <p>Add a habit first, then come back here to choose daily, weekly, or one-time reminders.</p>
              </EmptyState>
            ) : null}

            {!isLoading && !error ? (
            <div className="grid gap-5">
              {reminders.drafts.map((habit) => (
                <section
                  className={`rounded-[28px] border px-5 py-5 shadow-[0_16px_35px_rgba(15,23,42,0.06)] transition sm:px-6 ${
                    focusedHabitId === habit.id
                      ? "border-emerald-400 bg-emerald-50/40 ring-2 ring-emerald-100"
                      : habit.reminderEnabled
                        ? "border-emerald-200 bg-white"
                        : "border-slate-200 bg-[#fbfbf8]"
                  }`}
                  id={`reminder-habit-${habit.id}`}
                  key={habit.id}
                >
                  <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="grid gap-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold text-slate-950">{habit.name}</h2>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                            habit.reminderEnabled
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {habit.reminderEnabled ? "Active" : "Paused"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {habit.reminderEnabled
                          ? `Reminder will send: ${formatReminderSummary(habit)}`
                          : `Saved schedule: ${formatReminderSummary(habit)}`}
                      </p>
                    </div>
                    <ReminderToggle
                      isEnabled={habit.reminderEnabled}
                      label={`${habit.reminderEnabled ? "Disable" : "Enable"} reminder for ${habit.name}`}
                      onToggle={(nextValue) => reminders.setReminderEnabled(habit.id, nextValue)}
                    />
                  </div>
                  
                  {habit.reminderEnabled ?(
                  <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-slate-700" htmlFor={`time-${habit.id}`}>
                        Reminder time
                      </label>
                      <input
                        className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        id={`time-${habit.id}`}
                        onChange={(event) => reminders.setReminderTime(habit.id, event.target.value)}
                        type="time"
                        value={habit.reminderTime ?? "09:00"}
                      />
                    </div>

                    <div className="grid gap-5">
                      <div className="grid gap-2">
                        <p className="text-sm font-semibold text-slate-700">Schedule type</p>
                        <div className="flex flex-wrap gap-2">
                          {scheduleOptions.map((option) => (
                            <button
                              className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                                habit.scheduleType === option.value
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-slate-200 bg-white text-slate-600"
                              } disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400`}
                              key={option.value}
                              onClick={() => reminders.setScheduleType(habit.id, option.value)}
                              type="button"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {habit.scheduleType === "weekly" ? (
                        <div className="grid gap-3">
                          <p className="text-sm font-semibold text-slate-700">Send on these weekdays</p>
                          <div className="flex flex-wrap gap-2">
                            {weekdayOptions.map((weekday) => {
                              const isSelected = habit.weekdays.includes(weekday.value);

                              return (
                                <button
                                  className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                                    isSelected
                                      ? "border-slate-950 bg-slate-950 text-white"
                                      : "border-slate-200 bg-white text-slate-600"
                                  } disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400`}
                                  key={weekday.value}
                                  onClick={() => reminders.toggleWeekday(habit.id, weekday.value)}
                                  type="button"
                                >
                                  {weekday.label}
                                </button>
                              );
                            })}
                          </div>
                          {habit.reminderEnabled && habit.weekdays.length === 0 ? (
                            <p className="text-xs text-amber-600">Choose at least one weekday for this schedule.</p>
                          ) : null}
                        </div>
                      ) : null}

                      {habit.scheduleType === "specific_date" ? (
                        <div className="grid gap-2 max-w-[260px]">
                          <label className="text-sm font-semibold text-slate-700" htmlFor={`date-${habit.id}`}>
                            Send on this date
                          </label>
                          <input
                            className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                            id={`date-${habit.id}`}
                            onChange={(event) => reminders.setSpecificDate(habit.id, event.target.value)}
                            type="date"
                            value={habit.specificDate ?? ""}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-4 text-sm text-slate-600">
                      <p className="font-semibold text-slate-800">Reminder paused</p>
                      <p className="mt-1 leading-6">
                        The schedule is still saved as <span className="font-medium">{formatReminderSummary(habit)}</span>.
                        Turn the reminder back on to reuse or edit it.
                      </p>
                    </div>
                  )}
                </section>
              ))}
            </div>
            ) : null}
          </section>

          <aside className="xl:sticky xl:top-8 xl:self-start">
            <div className="rounded-[28px] border border-[#e8e6dc] bg-white p-6 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
              <div className="grid gap-2 border-b border-slate-100 pb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Delivery settings</p>
                <h2 className="text-xl font-semibold text-slate-950">Reminder inbox</h2>
              </div>

              <label className="mt-5 grid gap-2 text-sm font-semibold text-slate-700">
                Reminder email
                <input
                  className="h-12 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  onChange={(event) => reminders.setEmail(event.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  value={reminders.email}
                />
              </label>

              <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Timezone</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{reminders.timezone}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Reminder times use this timezone so the same saved time stays understandable.
                </p>
              </div>

              <Button
                className="mt-6 h-14 w-full rounded-xl text-lg"
                disabled={isLoading || reminders.isSaving}
                onClick={() => void handleSave()}
                type="button"
              >
                {reminders.isSaving ? "Saving..." : "Save reminder settings"}
              </Button>
              {reminders.savedMessage ? (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <p className="font-semibold">Saved</p>
                  <p className="mt-1">{reminders.savedMessage}</p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
