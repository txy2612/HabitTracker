import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../../config/env.js";
import { HttpError } from "../../shared/httpError.js";

export type HabitReminderEmailInput = {
  to: string;
  habitName: string;
  reminderTime: string;
  timezone: string;
};

let transporter: Transporter | null = null;

// check is SMTP settings and email are configured
export function isEmailConfigured() {
  return Boolean(env.email.smtpHost && env.email.from);
}

function getTransporter() {
  if (!isEmailConfigured()) {
    throw new HttpError(500, "Email reminders are not configured.", {
      title: "Email not configured",
      type: "https://habit-tracker.local/problems/email-not-configured",
    });
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.email.smtpHost,
      port: env.email.smtpPort,
      secure: env.email.smtpSecure,
      auth:
        env.email.smtpUser && env.email.smtpPass
          ? {
              user: env.email.smtpUser,
              pass: env.email.smtpPass,
            }
          : undefined,
    });
  }

  return transporter;
}

function buildHabitReminderText(input: HabitReminderEmailInput) {
  return [
    `Reminder: ${input.habitName}`,
    "",
    `It is ${input.reminderTime} in ${input.timezone}.`,
    `Time for your habit: ${input.habitName}.`,
  ].join("\n");
}

// Purpose: prevents weird input from breaking html (allow certain symbols to escaped and not interpreted as part of the html)
function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Creates plain text email:
// It is 18:00 in Asia/Kuala_Lumpur.
// Time for your habit: Jogging.
function buildHabitReminderHtml(input: HabitReminderEmailInput) {
  const habitName = escapeHtml(input.habitName);
  const reminderTime = escapeHtml(input.reminderTime);
  const timezone = escapeHtml(input.timezone);

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h1 style="font-size: 20px; margin: 0 0 12px;">Habit reminder</h1>
      <p style="margin: 0 0 8px;">It is <strong>${reminderTime}</strong> in ${timezone}.</p>
      <p style="margin: 0;">Time for your habit: <strong>${habitName}</strong>.</p>
    </div>
  `;
}

// 1. Build email
// 2. Connect transporter
// 3. Send email
export async function sendHabitReminderEmail(input: HabitReminderEmailInput): Promise<void> {
  // getTransporter -> creates connection
  // sim: pool.query(...)
  // Email -> transporter; Database -> pool
  await getTransporter().sendMail({
    from: env.email.from,
    to: input.to,
    subject: `Habit reminder: ${input.habitName}`,
    text: buildHabitReminderText(input),
    html: buildHabitReminderHtml(input),
  });
  /* from:...
     to:...
     subject:...
     text:...
 */
}
