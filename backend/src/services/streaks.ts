// calculate streaks from logs
import { addDays, todayString } from "../utils/dates.js";
import type { HabitLog, StreakSummary } from "../types.js";

export function calculateStreak(logs: HabitLog[]): StreakSummary {
  // Set remove duplicates
  const doneDates = [...new Set(logs.filter((log) => log.status === "done").map((log) => log.log_date))]
    .sort();// .sort() works bcz of YYYY-MM-DD fornat
  
    // no done logs -> curStreak = 0 , highestStreak = 0
    // ntg to calcu
  if (doneDates.length === 0) {
    return {
      currentStreak: 0,
      currentStartDate: null,
      currentEndDate: null,
      highestStreak: 0,
      highestStartDate: null,
      highestEndDate: null,
    };
  }

  // -- Cal highest streak --

  // track best 
  let highestStreak = 1;
  let highestStartDate = doneDates[0];
  let highestEndDate = doneDates[0];
  // track streak currently being scanned
  let runLength = 1; // streak currently being scanned
  let runStartDate = doneDates[0];

  // start index 1 bcz index 0 = first day streak
  for (let index = 1; index < doneDates.length; index += 1) {
    const previousDate = doneDates[index - 1];
    const currentDate = doneDates[index];

    // If current date is exactly previous date + 1 day,
    // continue the streak.
    if (currentDate === addDays(previousDate, 1)) {
      runLength += 1;
    } else {
    // Start a new streak from currentDate.
      runLength = 1;
      runStartDate = currentDate;
    }

    // If this run beats the previous best,
    // save it as the new highest streak.
    if (runLength > highestStreak) {
      highestStreak = runLength;
      highestStartDate = runStartDate;
      highestEndDate = currentDate;
    }
  }

  // -- Calculate current streak (streak alive tdy/ytd) --
  // doneDates = all unique done days, sorted
  // doneSet   = fast lookup: “was this date done?”
  // Set remove duplicates
  const doneSet = new Set(doneDates);
  const today = todayString();

  // If today is done: start counting backward from today
  // If today is not done: start counting backward from yesterday
  // cursor = date we are checking while walking backward
  let cursor = doneSet.has(today) ? today : addDays(today, -1);
  let currentStreak = 0;
  let currentEndDate: string | null = doneSet.has(cursor) ? cursor : null;// .has = Set method that asks: "Does this value exist in the Set?"
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
  };
}
