import { NotificationPermissionBanner } from "./components/NotificationPermissionBanner";
import { QuotePreview } from "./components/QuotePreview";
import { ReminderToggle } from "./components/ReminderToggle";
import { useReminders } from "./useReminders";

export function ReminderSettingsPage() {
  const reminders = useReminders();

  return (
    <main className="reminder-settings-placeholder">
      {/* TODO: Build reminder settings layout. */}
      <h1>Reminder Settings</h1>
      <NotificationPermissionBanner permission={reminders.permission} onEnable={reminders.enableReminder} />
      <ReminderToggle isEnabled={reminders.isEnabled} onToggle={() => {}} />
      <QuotePreview quote={reminders.quote} />
    </main>
  );
}
