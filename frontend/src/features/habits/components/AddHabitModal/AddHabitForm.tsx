import { Button } from "../../../../shared/components/Button";
import { Input } from "../../../../shared/components/Input";

export type AddHabitFormProps = {
  onCreated: () => void;
};

export function AddHabitForm({ onCreated }: AddHabitFormProps) {
  void onCreated;

  return (
    <form className="add-habit-form-placeholder">
      {/* TODO: Add controlled name input and submit only the habit name. */}
      <Input label="Habit name" name="name" />
      <Button type="submit">Create habit</Button>
    </form>
  );
}
