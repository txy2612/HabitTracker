export function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function currentMonthString() {
  return toDateString(new Date()).slice(0, 7);
}

export function getMonthDays(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const totalDays = new Date(year, monthNumber, 0).getDate();

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(year, monthNumber - 1, index + 1);
    return {
      date: toDateString(date),
      dayNumber: index + 1,
      weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
    };
  });
}

export function formatMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function shiftMonth(month: string, amount: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + amount);
  return toDateString(date).slice(0, 7);
}

export function formatDateRange(start: string | null, end: string | null) {
  if (!start || !end) {
    return "No dates yet";
  }

  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const startText = startDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endText = endDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return start === end ? startText : `${startText} - ${endText}`;
}
