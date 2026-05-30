import type { Habit } from "../../../shared/types/api.types";
import { Button } from "../../../shared/components/Button";// prep for one reusable button style
import { StreakDotsRow } from "../../habitLogs/components/StreakDotsRow";// uses streak dots components
import { QuickLogButton } from "./QuickLogButton";// Habit Card = layout; QuickLogButton = mark done/missed

export type HabitCardProps = {
  habit: Habit;
  onViewHabit: (habitId: string) => void;
  // when user clicks view, tell parent which habit was clicked
  // etc: habit.id="123" -> Click "view" -> onViewHabit("123")
};

export function HabitCard({ habit, onViewHabit }: HabitCardProps) {
  return (
    <article className="habit-card-placeholder">
      {/* TODO: Replace placeholder card markup with final habit card UI. */}
      <h2>{habit.name}</h2>
      <StreakDotsRow dates={[]} logs={[]} />
      <QuickLogButton habitId={habit.id} status="done" />
      <QuickLogButton habitId={habit.id} status="missed" /> 
      <Button type="button" onClick={() => onViewHabit(habit.id)}>
        View
      </Button>
    </article>
  );
}
