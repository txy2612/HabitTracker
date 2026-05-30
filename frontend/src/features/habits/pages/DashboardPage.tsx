import { useState } from "react";
import { AddHabitModal } from "../components/AddHabitModal/AddHabitModal";
import { HabitList } from "../components/HabitList";
import { Button } from "../../../shared/components/Button";
import { useHabits } from "../hooks/useHabits";

export function DashboardPage() {
  const { habits, isLoading, error, fetchHabits } = useHabits();
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

  function handleViewHabit(habitId: string) {
    // TODO: Navigate to HabitDetailPage later.
    console.log("View habit:", habitId);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-green-600">Habit Tracker</p>
            <h1 className="text-3xl font-bold text-gray-900">Today</h1>
            <p className="mt-2 text-gray-600">
              Track your habits one day at a time.
            </p>
          </div>

          <Button type="button" onClick={() => setIsAddHabitOpen(true)}>
            Add Habit
          </Button>
        </header>

        {isLoading && (
          <p className="text-sm text-gray-500">Loading habits...</p>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!isLoading && (
          <HabitList habits={habits} onViewHabit={handleViewHabit} />
        )}

        <AddHabitModal
          isOpen={isAddHabitOpen}
          onClose={() => setIsAddHabitOpen(false)}
          onCreated={fetchHabits}
        />
      </div>
    </main>
  );
}
