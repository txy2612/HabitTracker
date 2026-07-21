import { useState } from "react";
import { Button } from "../../../shared/components/Button";
import { ConfirmationModal } from "../../../shared/components/ConfirmationModal";
import { EmptyState } from "../../../shared/components/EmptyState";
import type { Habit } from "../../../shared/types/api.types";

export type ArchivedHabitsPageProps = {
  archivedHabits: Habit[];
  error: string | null;
  isLoading: boolean;
  successMessage?: string | null;
  onClose: () => void;
  onDismissSuccess?: () => void;
  onRetry: () => void;
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

function ArchivedHabitsLoadingState() {
  return (
    <section className="grid gap-4 lg:grid-cols-2" aria-label="Loading archived habits">
      {[0, 1, 2, 3].map((item) => (
        <div
          className="app-soft-card rounded-[24px] border px-5 py-5"
          key={item}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="grid flex-1 gap-3">
              <div className="h-5 w-44 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-56 animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="h-10 w-24 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </section>
  );
}

function ArchivedHabitsErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="mb-5 rounded-[24px] border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Could not load archived habits</p>
          <p className="mt-1">{message}</p>
        </div>
        <Button className="self-start rounded-full px-5" onClick={onRetry} type="button" variant="secondary">
          Try again
        </Button>
      </div>
    </section>
  );
}

function ArchivedHabitsSuccessState({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <section className="mb-5 rounded-[24px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Restored</p>
          <p className="mt-1">{message}</p>
        </div>
        {onDismiss ? (
          <button
            className="self-start rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 transition hover:bg-emerald-100"
            onClick={onDismiss}
            type="button"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function ArchivedHabitsPage({
  archivedHabits,
  error,
  isLoading,
  successMessage = null,
  onClose,
  onDismissSuccess,
  onRetry,
  onRestoreHabit,
}: ArchivedHabitsPageProps) {
  // many habits in archived, how to know which one is restoring -> s=restoring + id
  const [restoringHabitId, setRestoringHabitId] = useState<string | null>(null);
  const [habitPendingRestore, setHabitPendingRestore] = useState<Habit | null>(null);

  async function handleConfirmRestoreHabit() {
    if (!habitPendingRestore) {
      return;
    }

    try {
      setRestoringHabitId(habitPendingRestore.id);
      await onRestoreHabit(habitPendingRestore.id);
      setHabitPendingRestore(null);
    } finally {
      setRestoringHabitId(null);
    }
  }

  return (
    <main className="app-shell min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-[var(--app-border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--app-secondary)]">Archive</p>
            <h1 className="text-3xl font-semibold text-[var(--app-title)]">Archived Habits</h1>
            <p className="text-sm text-[var(--app-muted)]">Restore habits when you want them back in the main dashboard.</p>
          </div>
          <Button className="self-start rounded-full px-5" onClick={onClose} type="button" variant="secondary">
            Back to habits
          </Button>
        </header>

        {isLoading ? <ArchivedHabitsLoadingState /> : null}

        {error ? (
          <ArchivedHabitsErrorState message={error} onRetry={onRetry} />
        ) : null}

        {successMessage && !error ? (
          <ArchivedHabitsSuccessState message={successMessage} onDismiss={onDismissSuccess} />
        ) : null}

        {!isLoading && !error ? (
          <div className="app-soft-card mb-5 rounded-[24px] border px-5 py-4 text-sm text-[var(--app-soft-text)]">
            Archived habits are paused.
            <span className="ml-1 text-[var(--app-soft-muted)]">Restore one to edit reminders, logs, or habit details again.</span>
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
                className="app-soft-card rounded-[24px] border px-5 py-5"
                key={habit.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="grid gap-2">
                    <h2 className="text-lg font-semibold text-[var(--app-soft-text)]">{habit.name}</h2>
                    <p className="text-sm text-[var(--app-soft-muted)]">Archived on {formatArchivedDate(habit.archivedAt)}</p>
                  </div>
                  <Button
                    className="archive-restore-button rounded-full px-5"
                    disabled={restoringHabitId === habit.id}
                    onClick={() => setHabitPendingRestore(habit)}
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

        <ConfirmationModal
          confirmLabel="Restore habit"
          description={`Restore "${habitPendingRestore?.name ?? "this habit"}" to your dashboard so you can track it again.`}
          isConfirming={Boolean(habitPendingRestore && restoringHabitId === habitPendingRestore.id)}
          isOpen={Boolean(habitPendingRestore)}
          onCancel={() => setHabitPendingRestore(null)}
          onConfirm={() => void handleConfirmRestoreHabit()}
          title="Restore this habit?"
        />
      </div>
    </main>
  );
}
