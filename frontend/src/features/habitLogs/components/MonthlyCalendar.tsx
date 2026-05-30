import type { HabitLog } from "../../../shared/types/api.types";

export type MonthlyCalendarProps = {
  month: string;
  logs: HabitLog[];
  onSelectDate: (date: string) => void;
};

export function MonthlyCalendar({ month, logs, onSelectDate }: MonthlyCalendarProps) {
  void month;
  void logs;
  void onSelectDate;

  return (
    <section className="monthly-calendar-placeholder">
      {/* TODO: Show month grid with status cells. */}
      <p>Monthly calendar</p>
    </section>
  );
}
