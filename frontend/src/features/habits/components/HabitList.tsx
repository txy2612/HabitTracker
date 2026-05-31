//display component [no db, no fetch/apiClient (call API), no state (const)]
import type { Habit } from "../../../shared/types/api.types";
import { EmptyState } from "../../../shared/components/EmptyState";
import { HabitCard } from "./HabitCard";

// define what data/functions HabitList expect to receive
export type HabitListProps = {
  habits: Habit[];// array of Habit objects
  onViewHabit: (habitId: string) => void;// function (receives parameter) => returns ntg
  onDeleteHabit: (habitId: string) => void;
  onMoveHabitUp: (habitId: string) => void;
  onMoveHabitDown: (habitId: string) => void;
};

// destructuring:
// equi to :
  // export function HabitList(props: HabitListProps)
  // props = { habits, onViewHabit, ...}
export function HabitList({
  habits,
  onViewHabit,
  onDeleteHabit,
  onMoveHabitUp,
  onMoveHabitDown,
}: HabitListProps) {// destructuring
  // if empty show EmptyState
  if (habits.length === 0) {
    return (
      <EmptyState title="No habits yet">
        <p>Add your first habit to start tracking streaks.</p>
      </EmptyState>
    );
  }

  return (
    <section className="grid gap-3">
      {habits.map((habit, index) => (
        <HabitCard
          canMoveDown={index < habits.length - 1}
          canMoveUp={index > 0}
          habit={habit}
          key={habit.id}
          onDeleteHabit={onDeleteHabit}
          onMoveHabitDown={onMoveHabitDown}
          onMoveHabitUp={onMoveHabitUp}
          onViewHabit={onViewHabit}// 'view'on habit card
        />
      ))}
    </section>
  );
}
