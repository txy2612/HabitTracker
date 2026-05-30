import type { StreakSummary } from "../../../shared/types/api.types";

export type StreakStatsProps = {
  streak: StreakSummary | null;
};

export function StreakStats({ streak }: StreakStatsProps) {
  void streak;

  return (
    <section className="streak-stats-placeholder">
      {/* TODO: Show current and highest streak values. */}
      <p>Streak stats</p>
    </section>
  );
}
