import { useState } from "react";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import type { Habit } from "../../../shared/types/api.types";

export type ArchivedHabitsPageProps = {
  archivedHabits: Habit[];
  error: string | null;
  isLoading: boolean;
  onClose: () => void;
  onRestoreHabit: (habitId: string) => Promise<void>;
};

function formatArchivedDate(archivedAt: string | null) {
  if (!archivedAt) {
    return "Archived recently";
  }

  return new Date(archivedAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ArchivedHabitsPage({
  archivedHabits,
  error,
  isLoading,
  onClose,
  onRestoreHabit,
}: ArchivedHabitsPageProps) {
  // many habits in archived, how to know which one is restoring -> s=restoring + id
  const [restoringHabitId, setRestoringHabitId] = useState<string | null>(null);

  async function handleRestoreHabit(habitId: string) {
    try {
      setRestoringHabitId(habitId);
      await onRestoreHabit(habitId);
    } finally {
      setRestoringHabitId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-8 text-slate-950 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Archive</p>
            <h1 className="text-3xl font-semibold text-slate-950">Archived Habits</h1>
            <p className="text-sm text-slate-500">Restore habits when you want them back in the main dashboard.</p>
          </div>
          <Button className="self-start rounded-full px-5" onClick={onClose} type="button" variant="secondary">
            Back to habits
          </Button>
        </header>

        {isLoading ? <p className="px-1 text-sm text-slate-400">Loading archived habits...</p> : null}

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {!isLoading && !error ? (
          <div className="mb-5 rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            Archived habits are paused.
            <span className="ml-1 text-slate-500">Restore one to edit reminders, logs, or habit details again.</span>
          </div>
        ) : null}

        {!isLoading && !error && archivedHabits.length === 0 ? (
          <EmptyState title="No archived habits">
            <p>Archived habits will show up here once you archive them from the dashboard.</p>
          </EmptyState>
        ) : null}

        {!error && archivedHabits.length > 0 ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {archivedHabits.map((habit) => (
              <article
                className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                key={habit.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="grid gap-2">
                    <h2 className="text-lg font-semibold text-slate-950">{habit.name}</h2>
                    <p className="text-sm text-slate-500">Archived on {formatArchivedDate(habit.archivedAt)}</p>
                  </div>
                  <Button
                    className="rounded-full px-4"
                    disabled={restoringHabitId === habit.id}
                    onClick={() => void handleRestoreHabit(habit.id)}
                    type="button"
                    variant="secondary"
                  >
                    {restoringHabitId === habit.id ? "Restoring..." : "Restore"}
                  </Button>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
