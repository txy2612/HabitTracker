export type HabitDetailPageProps = {
  habitId: string;
};

export function HabitDetailPage({ habitId }: HabitDetailPageProps) {
  void habitId;

  return (
    <main className="habit-detail-placeholder">
      {/* TODO: Show monthly calendar, notes, and streak stats for one habit. */}
      <h1>Habit Detail</h1>
    </main>
  );
}
