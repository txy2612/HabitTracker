import { processDueEmailReminders } from "../modules/reminders/reminders.service.js";
import { logger } from "../logging/logger.js";

// job = alarm (scheduling)
// DO NOT decide who get reminders/not send email (NO business logic)

const REMINDER_CHECK_INTERVAL_MS = 60_000;// = 60s = 1 min

// with child logger:
// ev log includes job=reminder-cron
// job=reminder-cron  INFO  Sent reminder emails
// job=reminder-cron  ERROR Failed to send reminder
const reminderLogger = logger.child({
  job: "reminder-cron",
});

let interval: NodeJS.Timeout | null = null;// stores the timer
let isChecking = false;

// delegates everything to service (the business logic of reminders & email sending)
async function runReminderCheck() {
  if (isChecking) {// prevent concurrent + overlapping checks
    return;
  }

  isChecking = true;

  try {
    // get summary from service, by calling processDueEmailReminders()
    const summary = await processDueEmailReminders();

    // success logging : Sent 3 habit reminder email(s).
    if (summary.sent > 0) {
      reminderLogger.info({ sent: summary.sent }, "Sent habit reminder email(s).");
    }

    // failure logging
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

// starts repeating 1-min timer & runs one check
export function startReminderCron() {
  if (interval) {
    return;
  }

  interval = setInterval(() => {
    void runReminderCheck();
  }, REMINDER_CHECK_INTERVAL_MS);

  void runReminderCheck();
}

// stops timer
export function stopReminderCron() {
  if (!interval) {
    return;
  }

  clearInterval(interval);
  interval = null;
}
