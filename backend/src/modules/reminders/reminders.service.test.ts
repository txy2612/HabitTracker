import test from "node:test";
import assert from "node:assert/strict";
import {
  getReminderClock,
  isReminderDue,
  shouldDeactivateReminderAfterSend,
  type ReminderClock,
} from "./reminders.service.js";
import type { EmailReminderCandidate } from "./reminders.repository.js";

function createCandidate(
  overrides: Partial<EmailReminderCandidate> = {},
): EmailReminderCandidate {
  return {
    habit_id: "1",
    habit_name: "Read",
    schedule_type: "daily",
    reminder_time: "09:00:00",
    weekdays: [],
    specific_date: null,
    reminder_email: "demo@example.com",
    timezone: "UTC",
    ...overrides,
  };
}

function createClock(overrides: Partial<ReminderClock> = {}): ReminderClock {
  return {
    date: "2026-06-24",
    time: "09:00",
    weekday: 3,
    ...overrides,
  };
}

test("getReminderClock converts a UTC instant into the target local timezone", () => {
  const now = new Date("2026-06-24T00:00:00.000Z");

  const malaysiaClock = getReminderClock("Asia/Kuala_Lumpur", now);
  const newYorkClock = getReminderClock("America/New_York", now);

  assert.deepEqual(malaysiaClock, {
    date: "2026-06-24",
    time: "08:00",
    weekday: 3,
  });

  assert.deepEqual(newYorkClock, {
    date: "2026-06-23",
    time: "20:00",
    weekday: 2,
  });
});

test("isReminderDue returns true for a daily reminder when the time matches", () => {
  assert.equal(isReminderDue(createCandidate(), createClock()), true);
});

test("isReminderDue returns false when the reminder time does not match", () => {
  assert.equal(isReminderDue(createCandidate(), createClock({ time: "09:01" })), false);
});

test("isReminderDue returns true only on selected weekdays for weekly reminders", () => {
  const weeklyCandidate = createCandidate({
    schedule_type: "weekly",
    weekdays: [1, 3, 5],
  });

  assert.equal(isReminderDue(weeklyCandidate, createClock({ weekday: 3 })), true);
  assert.equal(isReminderDue(weeklyCandidate, createClock({ weekday: 4 })), false);
});

test("isReminderDue returns true only on the specific saved date for one-time reminders", () => {
  const specificDateCandidate = createCandidate({
    schedule_type: "specific_date",
    specific_date: "2026-06-24",
  });

  assert.equal(isReminderDue(specificDateCandidate, createClock({ date: "2026-06-24" })), true);
  assert.equal(isReminderDue(specificDateCandidate, createClock({ date: "2026-06-25" })), false);
});

test("shouldDeactivateReminderAfterSend only marks one-time reminders for deactivation", () => {
  assert.equal(shouldDeactivateReminderAfterSend(createCandidate()), false);
  assert.equal(
    shouldDeactivateReminderAfterSend(
      createCandidate({
        schedule_type: "specific_date",
        specific_date: "2026-06-24",
      }),
    ),
    true,
  );
});
