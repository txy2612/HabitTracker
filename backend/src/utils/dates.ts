const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const monthPattern = /^\d{4}-\d{2}$/;

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function isDateString(value: unknown): value is string {
  return typeof value === "string" && datePattern.test(value);
}

export function isMonthString(value: unknown): value is string {
  return typeof value === "string" && monthPattern.test(value);
}

export function addDays(dateString: string, amount: number) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function monthRange(month: string) {
  const start = `${month}-01`;
  const nextMonth = new Date(`${start}T00:00:00.000Z`);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);

  return {
    start,
    end: nextMonth.toISOString().slice(0, 10),
  };
}
