import type { Habit, ReminderScheduleType, ReminderWeekday } from "../../shared/types/api.types";
import { Button } from "../../shared/components/Button";
import { useReminders, type ReminderDraft } from "./useReminders";

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
  const time = habit.reminderTime ?? "09:00";

  if (habit.scheduleType === "weekly") {
    if (habit.weekdays.length === 0) {
      return `Saved schedule: pick weekdays at ${time}`;
    }

    const labels = weekdayOptions
      .filter((weekday) => habit.weekdays.includes(weekday.value))
      .map((weekday) => weekday.label)
      .join(", ");

    return `Saved schedule: ${labels} at ${time}`;
  }

  if (habit.scheduleType === "specific_date") {
    return `Saved schedule: ${habit.specificDate ?? "pick a date"} at ${time}`;
  }

  return `Saved schedule: every day at ${time}`;
}

export function ReminderSettingsPage({ habits, isLoading, error, onClose, onSaved }: ReminderSettingsPageProps) {
  const reminders = useReminders(habits);// custom hook (starts with 'use')

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
    <main className="min-h-screen bg-[#fafaf6] px-5 py-5 text-slate-950">
      <div className="mx-auto w-full max-w-[720px] rounded-[28px] border border-[#e7e5dc] bg-white px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:px-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Reminder Studio</p>
            <h1 className="text-2xl font-semibold text-slate-950">Habit Reminders</h1>
            <p className="text-sm text-slate-500">Choose a reusable schedule for each habit and send it to your reminder email.</p>
          </div>
          <button
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>

        <label className="mb-7 grid gap-2 text-sm font-semibold text-slate-700">
          Reminder email
          {/* onChange = triggered by user, when typing email */}
          {/* event handler -> state changes -> UI updates */}
          {/* <input value = {reminders.email} onChange= setEmail
           -> input shows email
           -> user types
           -> onChange update email state
           -> UI updates
           */}
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            onChange={(event) => reminders.setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={reminders.email}
          />
        </label>

        {isLoading ? <p className="text-sm text-slate-400">Loading habits...</p> : null}

        {error ? (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {reminders.error ? (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {reminders.error}
          </div>
        ) : null}

        {!isLoading && reminders.drafts.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            Add a habit first, then come back to set reminders.
          </p>
        ) : null}

        <div className="grid gap-5">
          {reminders.drafts.map((habit) => (
            <section
              className={`rounded-2xl border px-4 py-4 transition sm:px-5 ${
                habit.reminderEnabled ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-slate-50"
              }`}
              key={habit.id}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="grid gap-1">
                  <h2 className="text-base font-semibold text-slate-950">{habit.name}</h2>
                  <p className="text-sm text-slate-500">{formatReminderSummary(habit)}</p>
                </div>
                <button
                  aria-checked={habit.reminderEnabled}
                  aria-label={`${habit.reminderEnabled ? "Disable" : "Enable"} reminder for ${habit.name}`}
                  className={`relative h-9 w-16 shrink-0 rounded-full transition ${
                    habit.reminderEnabled ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                  onClick={() => reminders.setReminderEnabled(habit.id, !habit.reminderEnabled)}
                  role="switch"
                  type="button"
                >
                  <span
                    className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow-sm transition ${
                      habit.reminderEnabled ? "left-8" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2 sm:max-w-[180px]">
                  <label className="text-sm font-semibold text-slate-700" htmlFor={`time-${habit.id}`}>
                    Reminder time
                  </label>
                  <input
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    disabled={!habit.reminderEnabled}
                    id={`time-${habit.id}`}
                    onChange={(event) => reminders.setReminderTime(habit.id, event.target.value)}
                    type="time"
                    value={habit.reminderTime ?? "09:00"}
                  />
                </div>

                <div className="grid gap-2">
                  <p className="text-sm font-semibold text-slate-700">Schedule</p>
                  <div className="flex flex-wrap gap-2">
                    {scheduleOptions.map((option) => (
                      <button
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          habit.scheduleType === option.value
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-200 bg-white text-slate-600"
                        } disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400`}
                        disabled={!habit.reminderEnabled}
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
                  <div className="grid gap-2">
                    <p className="text-sm font-semibold text-slate-700">Send on</p>
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
                            disabled={!habit.reminderEnabled}
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
                  <div className="grid gap-2 sm:max-w-[220px]">
                    <label className="text-sm font-semibold text-slate-700" htmlFor={`date-${habit.id}`}>
                      Send on
                    </label>
                    <input
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      disabled={!habit.reminderEnabled}
                      id={`date-${habit.id}`}
                      onChange={(event) => reminders.setSpecificDate(habit.id, event.target.value)}
                      type="date"
                      value={habit.specificDate ?? ""}
                    />
                  </div>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <Button
            className="h-14 w-full rounded-xl text-lg"
            disabled={isLoading || reminders.isSaving}
            onClick={() => void handleSave()}
            type="button"
          >
            {reminders.isSaving ? "Saving..." : "Save"}
          </Button>
          {reminders.savedMessage ? (
            <p className="mt-3 text-center text-sm font-medium text-emerald-600">{reminders.savedMessage}</p>
          ) : null}
          <p className="mt-3 text-center text-xs text-slate-400">Timezone: {reminders.timezone}</p>
        </div>
      </div>
    </main>
  );
}
