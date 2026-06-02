// collection of date helper functions
// keep app using same format

const datePattern = /^\d{4}-\d{2}-\d{2}$/;// 2024-01-01 ✅ 31-05-2026 ❌ 2026/05/31 ❌ hello ❌
// $ = end
const monthPattern = /^\d{4}-\d{2}$/;

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function todayString() {
  return toDateString(new Date());
}

// type guard for date 
// "123" -> false, "banana" -> false
export function isDateString(value: unknown): value is string {
  // why "string" is important?
  // const value: unknown = req.body.date;
  // Typescript has no idea (str, num, bool, object, null)?
  // if later , 'value.toUpperCase()' -> crash
  return typeof value === "string" && datePattern.test(value);
}

export function isMonthString(value: unknown): value is string {
  return typeof value === "string" && monthPattern.test(value);
}

export function addDays(dateString: string, amount: number) {
  // append T00:00:00.000Z  = forces UTC, no timezome surprise
  const date = new Date(`${dateString}T00:00:00.000Z`);
  // if current day = 31, amount = 1
  // 31 + 1, May 32 -> June 1
  // useful for streak cal : addDays("2026-05-31", -1)
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function monthRange(month: string) {
  // moves May 1 -> June 1
  const start = `${month}-01`;
  const nextMonth = new Date(`${start}T00:00:00.000Z`);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);

  return {
    start,// 2026-05-01
    end: nextMonth.toISOString().slice(0, 10),// 2026-06-01 (not inclusive)
    // instead of setting as last day of May -> nonid to count 28d? 30d? 31d? (extra logic)
  };
}
