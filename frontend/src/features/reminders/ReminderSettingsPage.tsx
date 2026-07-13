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

const scheduleOptions: { value: ReminderScheduleType; label: string; icon: "daily" | "weekly" | "date" }[] = [
  { value: "daily", label: "Every day", icon: "daily" },
  { value: "weekly", label: "Days of week", icon: "weekly" },
  { value: "specific_date", label: "Specific date", icon: "date" },
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

function ScheduleIcon({ icon }: { icon: "daily" | "weekly" | "date" }) {
  if (icon === "daily") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 4v2.2m0 11.6V20m5.7-13.7-1.6 1.6M7.9 16.1l-1.6 1.6M20 12h-2.2M6.2 12H4m13.7 5.7-1.6-1.6M7.9 7.9 6.3 6.3M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (icon === "weekly") {
    return (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d="M7 4v3m10-3v3M5.5 9.5h13M7 13h.01M12 13h.01M17 13h.01M7 17h.01M12 17h.01M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v10A2.5 2.5 0 0 1 16.5 20h-9A2.5 2.5 0 0 1 5 17.5v-10Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M8 4v3m8-3v3M5 9.5h14M8 14h4m-7-6.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9A2.5 2.5 0 0 1 16.5 19h-9A2.5 2.5 0 0 1 5 16.5v-9Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ReminderPageSkeleton() {
  return (
    <div className="grid gap-5" aria-label="Loading reminder settings">
      {[0, 1, 2].map((item) => (
        <div
          className="app-soft-card rounded-[28px] border px-5 py-5"
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
    <main className="app-shell min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto w-full max-w-[1440px]">
        <header className="mb-8 flex flex-col gap-5 border-b border-[var(--app-border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--app-secondary)]">Reminder Studio</p>
            <h1 className="text-3xl font-bold text-[var(--app-title)] sm:text-4xl">Habit Reminders</h1>
            <p className="max-w-2xl text-sm leading-6 text-[var(--app-muted)]">
              Choose when each habit should nudge you. Turning a reminder off pauses it, but keeps the saved schedule ready
              for later.
            </p>
          </div>
          <button
            className="self-start rounded-full border border-[var(--app-border)] bg-[var(--app-control-surface)] px-4 py-2 text-sm font-semibold text-[var(--app-text)] transition hover:brightness-95"
            onClick={onClose}
            type="button"
          >
            Back to dashboard
          </button>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
          <section className="grid gap-4 xl:order-1">
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
            <div className="grid gap-4">
              {reminders.drafts.map((habit) => (
                <section
                  className={`app-soft-card rounded-[24px] border px-4 py-4 transition sm:px-5 ${
                    focusedHabitId === habit.id
                      ? "border-[var(--app-accent)] shadow-[0_0_0_4px_var(--app-accent-soft),0_18px_44px_color-mix(in_srgb,var(--app-accent)_24%,transparent)] ring-2 ring-[var(--app-accent)]"
                      : habit.reminderEnabled
                        ? "border-[var(--app-soft-border)]"
                        : "border-[var(--app-soft-border)]"
                  }`}
                  id={`reminder-habit-${habit.id}`}
                  key={habit.id}
                >
                  <div className="mb-4 flex flex-col gap-3 border-b border-[var(--app-soft-border)] pb-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="grid gap-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-[var(--app-soft-text)]">{habit.name}</h2>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                            habit.reminderEnabled
                              ? "bg-[var(--app-accent-soft)] text-[var(--app-accent-strong)]"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {habit.reminderEnabled ? "Active" : "Paused"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[var(--app-soft-muted)]">
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
                  <div className="grid gap-4 xl:grid-cols-[250px_minmax(0,1fr)] xl:items-start">
                    <div className="grid gap-2 xl:row-start-1">
                      <label className="text-sm font-semibold text-[var(--app-soft-text)]" htmlFor={`time-${habit.id}`}>
                        Reminder time
                      </label>
                      <input
                        className="h-11 rounded-xl border border-[var(--app-soft-border)] bg-white px-3 text-base text-[var(--app-soft-text)] outline-none transition focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                        id={`time-${habit.id}`}
                        onChange={(event) => reminders.setReminderTime(habit.id, event.target.value)}
                        type="time"
                        value={habit.reminderTime ?? "09:00"}
                      />
                    </div>

                    <div className="grid gap-4 xl:row-start-1">
                      <div className="grid gap-2">
                        <p className="text-sm font-semibold text-[var(--app-soft-text)]">Schedule type</p>
                        <div className="flex flex-wrap gap-2">
                          {scheduleOptions.map((option) => (
                            <button
                              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                                habit.scheduleType === option.value
                                  ? "border-[var(--app-accent)] bg-[var(--app-accent)] text-white"
                                  : "border-[var(--app-soft-border)] bg-[var(--app-soft-surface-muted)] text-[var(--app-soft-muted)]"
                              } disabled:cursor-not-allowed disabled:border-[var(--app-soft-border)] disabled:bg-[var(--app-soft-surface-muted)] disabled:text-[var(--app-soft-muted)]`}
                              key={option.value}
                              onClick={() => reminders.setScheduleType(habit.id, option.value)}
                              type="button"
                            >
                              <ScheduleIcon icon={option.icon} />
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {habit.scheduleType === "weekly" ? (
                      <div className="grid gap-3 xl:col-start-2">
                        <p className="text-sm font-semibold text-[var(--app-soft-text)]">Send on these weekdays</p>
                        <div className="flex flex-wrap gap-2">
                          {weekdayOptions.map((weekday) => {
                            const isSelected = habit.weekdays.includes(weekday.value);

                            return (
                              <button
                                className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                                  isSelected
                                    ? "border-[var(--app-accent)] bg-[var(--app-accent)] text-white"
                                    : "border-[var(--app-soft-border)] bg-[var(--app-soft-surface-muted)] text-[var(--app-soft-muted)]"
                                } disabled:cursor-not-allowed disabled:border-[var(--app-soft-border)] disabled:bg-[var(--app-soft-surface-muted)] disabled:text-[var(--app-soft-muted)]`}
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
                      <div className="grid max-w-[325px] gap-2 xl:col-start-2">
                        <label className="text-sm font-semibold text-[var(--app-soft-text)]" htmlFor={`date-${habit.id}`}>
                          Send on this date
                        </label>
                        <input
                          className="h-11 rounded-xl border border-[var(--app-soft-border)] bg-white px-3 text-base text-[var(--app-soft-text)] outline-none transition focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                          id={`date-${habit.id}`}
                          onChange={(event) => reminders.setSpecificDate(habit.id, event.target.value)}
                          type="date"
                          value={habit.specificDate ?? ""}
                        />
                      </div>
                    ) : null}
                  </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[var(--app-soft-border)] bg-[var(--app-soft-surface-muted)] px-4 py-3 text-sm text-[var(--app-soft-muted)]">
                      <p className="font-semibold text-[var(--app-soft-text)]">Reminder paused</p>
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

          <aside className="order-first xl:order-2 xl:sticky xl:top-8 xl:self-start">
            <div className="app-soft-card rounded-[28px] border p-6">
              <div className="grid gap-2 border-b border-[var(--app-soft-border)] pb-5">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c46d8c]">Delivery settings</p>
                <h2 className="text-xl font-semibold text-[#26344f]">Reminder inbox</h2>
              </div>

              <label className="mt-5 grid gap-2 text-sm font-semibold text-[#26344f]">
                Reminder email
                <input
                  className="h-12 rounded-xl border border-[var(--app-soft-border)] bg-white px-3 text-base text-[var(--app-soft-text)] outline-none transition placeholder:text-[var(--app-soft-muted)] focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent-soft)]"
                  onChange={(event) => reminders.setEmail(event.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  value={reminders.email}
                />
              </label>

              <div className="mt-5 rounded-2xl bg-[var(--app-soft-surface-muted)] px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c46d8c]">Timezone</p>
                <p className="mt-2 text-sm font-semibold text-[#26344f]">{reminders.timezone}</p>
                <p className="mt-1 text-xs leading-5 text-[#6f6a86]">
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
