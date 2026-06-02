import { processDueEmailReminders } from "../modules/reminders/reminders.service.js";

// job = alarm (scheduling)
// DO NOT decide who get reminders/not send email (NO business logic)

const REMINDER_CHECK_INTERVAL_MS = 60_000;// = 60s = 1 min

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
      console.log(`Sent ${summary.sent} habit reminder email(s).`);
    }

    // failure logging
    if (summary.failures.length > 0) {
      console.error("Some habit reminder emails failed to send.", summary.failures);
    }
  } catch (error) {
    console.error("Habit reminder check failed.", error);
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
