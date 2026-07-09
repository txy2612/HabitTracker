import { useState } from "react";
import type { CreateHabitInput } from "../../shared/types/api.types";
import { Button } from "../../shared/components/Button";
import { AddHabitModal } from "./components/AddHabitModal";
import { HabitList } from "./components/HabitList";
import { useHabits } from "./useHabits";
import { HabitDetailPage } from "./HabitDetailPage";
import { ReminderSettingsPage } from "../reminders/ReminderSettingsPage";

export function DashboardPage() {
  
  // dashboard itself doesnt fetch directly, it asks the hook
  // get habit state from useHabits
  const {
    habits, // get the list of habits
    isLoading, // tell if loading/error
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    fetchHabits,
    moveHabitLocal,
  } = useHabits();

  // Modal state
  // onClick={() => setIsAddHabitOpen(true)} -> click opens the modal
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

  // false -> dashboard showing, true -> reminder page showing
  const [isReminderCenterOpen, setIsReminderCenterOpen] = useState(false);

  // selectedHabitId = null -> no habit is selected
  // these states will be passed to children component at the code at the bottom (child component receive it as props)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null); 
  const selectedHabit = habits.find((habit) => habit.id === selectedHabitId);

  function handleViewHabit(habitId: string) {
    setSelectedHabitId(habitId);
  }

  // pass from input to useHabits
  async function handleCreateHabit(input: CreateHabitInput) {
    await createHabit(input);
  }

  async function handleHabitCreated() {
    setIsAddHabitOpen(false);
    await fetchHabits(); // reload habits from backend
  }

  if (selectedHabit) {
    return <HabitDetailPage habit={selectedHabit} onClose={() => setSelectedHabitId(null)} />;
  }

  // switch page when Reminder Center is opne
  if (isReminderCenterOpen) {
    return (
      <ReminderSettingsPage
        error={error}
        habits={habits}
        isLoading={isLoading}
        onClose={() => setIsReminderCenterOpen(false)}
        onSaved={fetchHabits}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-8 text-slate-950 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-950">Habits</h1>
          <div className="flex h-12 items-center gap-3">
            {/* User clicks bell -> setIsReminderOpen(true) -> React rerenders dahsboard  */}
            <Button
              aria-label="Open habit reminders"
              className="h-12 min-h-12 w-12 rounded-full p-0 text-slate-700"
              onClick={() => setIsReminderCenterOpen(true)}
              title="Reminders"
              type="button"
              variant="ghost"
            >
              {/* svg = drawing instead of picture file */}
              {/* ucide = collections of svg code */}
              <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path
                  d="M15 17H9M18 8A6 6 0 0 0 6 8c0 7-3 7-3 9h18c0-2-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </Button>
            <Button className="h-12 min-h-12 rounded-full px-5" onClick={() => setIsAddHabitOpen(true)} type="button">
              + Add Habit
            </Button>
          </div>
        </header>

        {/* show loading text if is loading */}
        {isLoading ? <p className="px-1 text-sm text-slate-400">Loading habits...</p> : null}

         {/* show error text if is API failed */}
        {error ? (
          <div className="mb-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

         {/* Only show habit list after loading is done. */}
         {/* Props passed to HabitList: */}
         {/* 1)the data: habits */}
         {/* 2)actions: view, delete, move up down */}
        {!isLoading ? (
          <HabitList
            habits={habits}
            onDeleteHabit={deleteHabit}
            onMoveHabitDown={(habitId) => moveHabitLocal(habitId, "down")}
            onMoveHabitUp={(habitId) => moveHabitLocal(habitId, "up")}
            onUpdateHabit={(habitId, name) => updateHabit(habitId, { name })}
            onViewHabit={handleViewHabit}
          />
        ) : null}

        {/* Parent pass Prop VALUES to child */}
        <AddHabitModal
          isOpen={isAddHabitOpen}
          onClose={() => setIsAddHabitOpen(false)}
          onCreate={handleCreateHabit}
          onCreated={handleHabitCreated}
        />
      </div>
    </main>
  );
}
