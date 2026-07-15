export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getTodayIsoDate(): string {
  return toDateString(new Date());
}

export function todayString(): string {
  return getTodayIsoDate();
}

export function getRecentDays(dayCount: number): string[] {
  if (!Number.isInteger(dayCount) || dayCount < 1) {
    throw new RangeError("dayCount must be a positive integer.");
  }

  const today = new Date();

  // common mistake: using toISOSTring() might shuft date because it cconverts to UTC
  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(today);
    // final item in returned array = today; 1st item = dayCount-1 days ago
    date.setDate(today.getDate() - (dayCount - 1) + index);

    // toDateSTring() defines YYYY-MM-DD format
    return toDateString(date);
  });
}

export function getRecentSevenDays(): string[] {
  return getRecentDays(7);
}

export function getDayNumber(dateString: string): string {
  return String(new Date(`${dateString}T00:00:00`).getDate());
}

export function formatRecentDayLabel(dateString: string): string {
  if (dateString === todayString()) {
    return "Today";
  }

  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export function currentMonthString(): string {
  return todayString().slice(0, 7);
}

export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);

  return new Date(year, monthNumber - 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function formatMonthName(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);

  return new Date(year, monthNumber - 1).toLocaleDateString(undefined, {
    month: "long",
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

export type CalendarDate = {
  date: string;
  isCurrentMonth: boolean;
};

export function getMonthCalendarDates(month: string): CalendarDate[] {
  const monthDates = getMonthDates(month);
  const firstDate = new Date(`${monthDates[0]}T00:00:00`);
  const lastDate = new Date(`${monthDates[monthDates.length - 1]}T00:00:00`);
  const firstDay = firstDate.getDay();
  const lastDay = lastDate.getDay();
  const leadingDays = firstDay;
  const trailingDays = 6 - lastDay;

  const previousDates = Array.from({ length: leadingDays }, (_, index) => {
    const date = new Date(firstDate);
    date.setDate(firstDate.getDate() - leadingDays + index);

    return {
      date: toDateString(date),
      isCurrentMonth: false,
    };
  });

  const currentDates = monthDates.map((date) => ({
    date,
    isCurrentMonth: true,
  }));

  const nextDates = Array.from({ length: trailingDays }, (_, index) => {
    const date = new Date(lastDate);
    date.setDate(lastDate.getDate() + index + 1);

    return {
      date: toDateString(date),
      isCurrentMonth: false,
    };
  });

  return [...previousDates, ...currentDates, ...nextDates];
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
