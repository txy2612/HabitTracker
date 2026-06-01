import type { HabitLog, HabitLogStatus } from "../../shared/types.js";
import { monthRange, todayString } from "../../shared/utils/dates.js";
import { HttpError } from "../../shared/httpError.js";
import { deleteHabitLogByDate, findHabitLogsForRange, upsertHabitLog } from "./habitLogs.repository.js";

export async function saveHabitLog(input: {
  habitId: string;
  logDate: string;
  status: HabitLogStatus;
  note: string | null;
}): Promise<HabitLog> {
  if (input.logDate > todayString()) {
    throw new HttpError(400, "Cannot log future dates.", {
      title: "Invalid habit log",
      type: "https://habit-tracker.local/problems/future-log-date",
    });
  }

  return upsertHabitLog(input);
}

export async function getHabitLogs(input: { habitId: string; month: string }): Promise<HabitLog[]> {
  const range = monthRange(input.month);

  return findHabitLogsForRange({
    habitId: input.habitId,
    start: range.start,
    end: range.end,
  });
}

export async function deleteHabitLog(input: { habitId: string; date: string }): Promise<void> {
  await deleteHabitLogByDate(input);
}
