import { useState, type FormEvent } from "react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import type { CreateHabitInput } from "../../../shared/types/api.types";

export type AddHabitFormProps = {
  onCreated: () => void;
  onCreate: (input: CreateHabitInput) => Promise<void>;
};

export function AddHabitForm({ onCreated, onCreate }: AddHabitFormProps) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onCreate({ name: trimmedName });
      setName("");
      onCreated();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create habit.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <Input
        label="Habit name"
        name="name"
        onChange={(event) => setName(event.target.value)}
        placeholder="Morning Exercise"
        value={name}
      />
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <Button disabled={isSaving || !name.trim()} type="submit">
        {isSaving ? "Creating..." : "Create habit"}
      </Button>
    </form>
  );
}
