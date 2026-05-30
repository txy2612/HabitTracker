import type { HabitLog } from "../../../shared/types/api.types";
import { StatusDot } from "../../../shared/components/StatusDot";

export type StreakDotsRowProps = {
  dates: string[];
  logs: HabitLog[];
};

export function StreakDotsRow({ dates, logs }: StreakDotsRowProps) {
  void logs;

  return (
    <div className="streak-dots-row-placeholder">
      {/* TODO: Match each date to its log status. */}
      {dates.map((date) => (
        <StatusDot key={date} />
      ))}
    </div>
  );
}
