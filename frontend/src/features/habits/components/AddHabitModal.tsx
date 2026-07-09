import { useState, type FormEvent } from "react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Modal } from "../../../shared/components/Modal";
import type { CreateHabitInput } from "../../../shared/types/api.types";

// 1. props expecting from parents
export type AddHabitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  onCreate: (input: CreateHabitInput) => Promise<void>;
};

// 2. receive 
export function AddHabitModal({ isOpen, onClose, onCreated, onCreate }: AddHabitModalProps) {
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

  // 3. use
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add habit">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <Input
          label="Habit name"
          name="name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Morning Exercise"
          value={name}
        />

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <div className="flex justify-end">
          <Button className="h-11 px-6" disabled={isSaving || !name.trim()} type="submit">
            {isSaving ? "Creating..." : "Create habit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
