import { pool } from "../db/pool.js";
import { processDueEmailReminders, type ReminderProcessingSummary } from "../modules/reminders/reminders.service.js";

// format the summary -> console easier to read, converts:
// checked: 5
// -> Due reminders checked: 5
function formatSummary(summary: ReminderProcessingSummary) {
  return [
    "Reminder check complete.",
    `Email configured: ${summary.skippedEmailNotConfigured ? "no" : "yes"}`,
    `Due reminders checked: ${summary.checked}`,
    `Emails sent: ${summary.sent}`,
    `Already sent today: ${summary.skippedAlreadySent}`,
    `Failures: ${summary.failures.length}`,
  ].join("\n");
}

async function main() {
  // get summary from service
  const summary = await processDueEmailReminders();

  console.log(formatSummary(summary));

  // print failures
  if (summary.failures.length > 0) {
    console.error("Failed reminders:");
    for (const failure of summary.failures) {
      console.error(`- ${failure.habitName} (${failure.habitId}): ${failure.message}`);
    }
  }
}

try {
  await main();
} catch (error) {
  console.error("Reminder check failed.", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
