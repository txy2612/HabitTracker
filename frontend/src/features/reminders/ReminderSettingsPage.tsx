import type { Habit } from "../../shared/types/api.types";
import { Button } from "../../shared/components/Button";
import { useReminders } from "./useReminders";

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


// 2. receive
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
    <main className="min-h-screen bg-[#fafafa] px-5 py-5 text-slate-950">
      <div className="mx-auto w-full max-w-[430px] rounded-[20px] bg-white px-7 py-6 shadow-[0_2px_10px_rgba(15,23,42,0.10)]">
        <header className="mb-8 flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-slate-950">Habit Reminders</h1>
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
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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

        <div className="grid gap-6">
          {reminders.drafts.map((habit) => (
            <div className="grid grid-cols-[1fr_auto_96px] items-center gap-4" key={habit.id}>
              <p className="min-w-0 text-base font-semibold text-slate-950">{habit.name}</p>

              {/* toggle reminder */}
              {/* event handler -> state changes -> UI updates */}
              <button
                aria-checked={habit.reminderEnabled}
                aria-label={`${habit.reminderEnabled ? "Disable" : "Enable"} reminder for ${habit.name}`}
                className={`relative h-9 w-16 rounded-full transition ${
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
              
              {/* onChange - change time */}
              {/* event handler -> state changes -> UI updates */}
              {/* <input value={reminderTime}  onChange=setTime()
              -> input shows reminder time
              -> onChange update time states 
              -> UI updates
               */}
              {habit.reminderEnabled ? (
                <input
                  aria-label={`Reminder time for ${habit.name}`}
                  className="h-11 w-24 rounded-md border border-slate-200 bg-white px-2 text-center text-base text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  onChange={(event) => reminders.setReminderTime(habit.id, event.target.value)}
                  type="time"
                  value={habit.reminderTime ?? "09:00"}
                />
              ) : (
                <span className="text-center text-base font-medium text-slate-400">--</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
           {/* event handler -> state changes -> UI updates */}
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
