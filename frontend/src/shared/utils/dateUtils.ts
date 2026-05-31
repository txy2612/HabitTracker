export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayIsoDate(): string {
  return toDateString(new Date());
}

export function getRecentSevenDays(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + mondayOffset + index);
    return toDateString(date);
  });
}

export function getDayNumber(dateString: string): string {
  return String(new Date(`${dateString}T00:00:00`).getDate());
}

export function currentMonthString(): string {
  return getTodayIsoDate().slice(0, 7);
}

export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);

  return new Date(year, monthNumber - 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function getMonthDates(month: string): string[] {
  const [year, monthNumber] = month.split("-").map(Number);
  const totalDays = new Date(year, monthNumber, 0).getDate();

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(year, monthNumber - 1, index + 1);
    return toDateString(date);
  });
}

export function shiftMonth(month: string, amount: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + amount);

  return toDateString(date).slice(0, 7);
}

export function formatDateRange(
  start: string | null,
  end: string | null
): string {
  if (!start || !end) {
    return "No dates yet";
  }

  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  const startText = startDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const endText = endDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return start === end ? startText : `${startText} - ${endText}`;
}
