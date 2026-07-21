  import { useState, type FormEvent } from "react";
  import { Button } from "../../../shared/components/Button";
  import { Input } from "../../../shared/components/Input";
  import { Modal } from "../../../shared/components/Modal";
  import type { CreateHabitInput } from "../../../shared/types/api.types";

  // 1. props expecting from parents
  export type AddHabitModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (habitName: string) => void;
    onCreate: (input: CreateHabitInput) => Promise<void>;
  };

  // 2. receive 
  export function AddHabitModal({ isOpen, onClose, onCreated, onCreate }: AddHabitModalProps) {
    const [name, setName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const trimmedName = name.trim();

    function handleClose() {
      if (isSaving) {
        return;
      }

      setName("");
      setError(null);
      onClose();
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      if (!trimmedName) {
        setError("Give this habit a short name first.");
        return;
      }

      try {
        setIsSaving(true);
        setError(null);
        await onCreate({ name: trimmedName });
        setName("");
        onCreated(trimmedName);
      } catch (createError) {
        setError(createError instanceof Error ? createError.message : "Failed to create habit.");
      } finally {
        setIsSaving(false);
      }
    }

    // 3. use
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Add a new habit">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-accent-soft)] px-4 py-3 text-sm text-[var(--app-text)]">
            <p className="font-semibold">Start simple</p>
            <p className="mt-1 leading-6">
              You can add reminders, notes, and logs after the habit is created.
            </p>
          </div>

          <Input
            autoFocus
            className="h-12 rounded-2xl px-4 text-base font-medium"
            disabled={isSaving}
            label="Habit name"
            maxLength={80}
            name="name"
            onChange={(event) => {
              setError(null);
              setName(event.target.value);
            }}
            placeholder="Read 20 pages"
            value={name}
          />
          <p className="-mt-3 text-xs text-[var(--app-muted)]">
            Examples: Drink water, Stretch, Read 20 pages, Sleep before 11.
          </p>

          {error ? (
            <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-[auto_auto] sm:justify-end">
            <Button className="h-11 rounded-full px-6" disabled={isSaving} onClick={handleClose} type="button" variant="secondary">
              Cancel
            </Button>
            <Button className="h-11 rounded-full px-6" disabled={isSaving || !trimmedName} type="submit">
              {isSaving ? "Creating..." : "Create habit"}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }
