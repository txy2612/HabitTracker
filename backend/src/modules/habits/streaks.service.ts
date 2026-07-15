import type { HabitLog, StreakSummary } from "../../shared/types.js";
import { addDays, todayString } from "../../shared/utils/dates.js";
import { findHabitLogsForStreak } from "./streaks.repository.js";

export async function getStreak(userId: string, habitId: string): Promise<StreakSummary> {
  void userId;
  const logs = await findHabitLogsForStreak(habitId);

  return calculateStreak(logs);
}

function calculateStreak(logs: HabitLog[]): StreakSummary {
  const doneDates = [...new Set(logs.filter((log) => log.status === "done").map((log) => log.log_date))].sort();

  if (doneDates.length === 0) {
    return {
      currentStreak: 0,
      currentStartDate: null,
      currentEndDate: null,
      highestStreak: 0,
      highestStartDate: null,
      highestEndDate: null,
      lastCompletedDate: null,
    };
  }

  let highestStreak = 1;
  let highestStartDate = doneDates[0];
  let highestEndDate = doneDates[0];
  let runLength = 1;
  let runStartDate = doneDates[0];

  for (let index = 1; index < doneDates.length; index += 1) {
    const previousDate = doneDates[index - 1];
    const currentDate = doneDates[index];

    if (currentDate === addDays(previousDate, 1)) {
      runLength += 1;
    } else {
      runLength = 1;
      runStartDate = currentDate;
    }

    if (runLength > highestStreak) {
      highestStreak = runLength;
      highestStartDate = runStartDate;
      highestEndDate = currentDate;
    }
  }

  const doneSet = new Set(doneDates);
  const today = todayString();
  let cursor = doneSet.has(today) ? today : addDays(today, -1);
  let currentStreak = 0;
  let currentEndDate: string | null = doneSet.has(cursor) ? cursor : null;
  let currentStartDate: string | null = null;

  while (doneSet.has(cursor)) {
    currentStreak += 1;
    currentStartDate = cursor;
    cursor = addDays(cursor, -1);
  }

  if (currentStreak === 0) {
    currentEndDate = null;
  }

  return {
    currentStreak,
    currentStartDate,
    currentEndDate,
    highestStreak,
    highestStartDate,
    highestEndDate,
    lastCompletedDate: doneDates[doneDates.length - 1],
  };
}
