
//HabitList = Render list + pass navigation callback
import type { Habit } from "../../../shared/types/api.types";
import { EmptyState } from "../../../shared/components/EmptyState";// styling 'No habits yet', 'No logs yet', 'No notifications yet', ... in the same way
import { HabitCard } from "./HabitCard";

export type HabitListProps = {
  habits: Habit[];
  onViewHabit: (habitId: string) => void;
};

export function HabitList({ habits, onViewHabit }: HabitListProps) {
  if (habits.length === 0) {
    return <EmptyState title="No habits yet" />;
  }

  return (
    <section className="habit-list-placeholder">
      {/* TODO: Render habit cards with spacing and empty state polish. */}
      {habits.map((habit) => (
        <HabitCard habit={habit} key={habit.id} onViewHabit={onViewHabit} />
      ))}
    </section>
  );
}
