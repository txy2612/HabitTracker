import type { HabitLog, HabitLogStatus } from "../../types.js";
import { monthRange } from "../../utils/dates.js";
import { deleteHabitLogByDate, findHabitLogsForRange, upsertHabitLog } from "./habitLogs.repository.js";

export async function saveHabitLog(input: {
  habitId: string;
  logDate: string;
  status: HabitLogStatus;
  note: string | null;
}): Promise<HabitLog> {
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
