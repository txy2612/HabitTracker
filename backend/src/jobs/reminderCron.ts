import { processDueEmailReminders } from "../modules/reminders/reminders.service.js";
import { logger } from "../logging/logger.js";

const REMINDER_CHECK_INTERVAL_MS = 60_000;

const reminderLogger = logger.child({
  job: "reminder-cron",
});

let interval: NodeJS.Timeout | null = null;
let isChecking = false;

async function runReminderCheck() {
  if (isChecking) {
    return;
  }

  isChecking = true;

  try {
    const summary = await processDueEmailReminders();

    // Keep this one structured log per tick so reliability trends are visible.
    reminderLogger.info(
      {
        checked: summary.checked,
        queued: summary.queued,
        claimed: summary.claimed,
        sent: summary.sent,
        retried: summary.retried,
        permanentlyFailed: summary.permanentlyFailed,
        skippedAlreadySent: summary.skippedAlreadySent,
        skippedEmailNotConfigured: summary.skippedEmailNotConfigured,
        avgSendLatencyMs: summary.avgSendLatencyMs,
      },
      "Reminder check completed.",
    );

    if (summary.failures.length > 0) {
      reminderLogger.error(
        { failures: summary.failures },
        "Some habit reminder emails failed to send.",
      );
    }
  } catch (error) {
    reminderLogger.error({ err: error }, "Habit reminder check failed.");
  } finally {
    isChecking = false;
  }
}

export function startReminderCron() {
  if (interval) {
    return;
  }

  interval = setInterval(() => {
    void runReminderCheck();
  }, REMINDER_CHECK_INTERVAL_MS);

  void runReminderCheck();
}

export function stopReminderCron() {
  if (!interval) {
    return;
  }

  clearInterval(interval);
  interval = null;
}
