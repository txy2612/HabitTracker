//display one habit
import type { Habit } from "../../../shared/types/api.types";

type HabitCardProps = {
  habit: Habit;// receives habit
};

export function HabitCard({ habit }: HabitCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>

      <p className="mt-1 text-sm text-gray-500">
        Created on {new Date(habit.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}