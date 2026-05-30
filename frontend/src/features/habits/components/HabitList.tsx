// loop thru habits
import type { Habit } from "../../../shared/types/api.types";
import { HabitCard } from "./HabitCard";

type HabitListProps = {
  habits: Habit[];// recieve list of habits
};

export function HabitList({ habits }: HabitListProps) {
    // if no habits yet, add your first to get started
  if (habits.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
        No habits yet. Add your first habit to get started.
      </div>
    );
  }

  return (
    // for each 'habit', create one HabitCard
    // .map = loop 
    // why not put html code dircetly? might have more elements to habit box later -> too long
    <div className="space-y-3">
      {habits.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}