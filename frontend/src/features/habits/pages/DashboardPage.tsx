import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import type { CreateHabitInput } from "../../../shared/types/api.types";
import { Button } from "../../../shared/components/Button";
import { AddHabitModal } from "../components/AddHabitModal";
import { HabitList } from "../components/HabitList";
import { useHabits } from "../hooks/useHabits";
import { HabitDetailPage } from "./HabitDetailPage";
import { ReminderSettingsPage } from "../../reminders/ReminderSettingsPage";

export function DashboardPage() {
  const { logout, user } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  
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
  } = useHabits();

  // Modal state
  // onClick={() => setIsAddHabitOpen(true)} -> click opens the modal
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

  // false -> dashboard showing, true -> reminder page showing
  const [isReminderCenterOpen, setIsReminderCenterOpen] = useState(false);
  const [focusedReminderHabitId, setFocusedReminderHabitId] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // selectedHabitId = null -> no habit is selected
  // these states will be passed to children component at the code at the bottom (child component receive it as props)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null); 
  const selectedHabit = habits.find((habit) => habit.id === selectedHabitId);
  const userInitials = useMemo(() => {
    const source = user?.name?.trim() || user?.email?.trim() || "User";
    const parts = source.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
    }

    return source.slice(0, 2).toUpperCase();
  }, [user?.email, user?.name]);

  function handleViewHabit(habitId: string) {
    setSelectedHabitId(habitId);
  }

  function handleOpenReminderCenter() {
    setFocusedReminderHabitId(null);
    setIsReminderCenterOpen(true);
  }

  function handleEditHabitReminder(habitId: string) {
    setFocusedReminderHabitId(habitId);
    setIsReminderCenterOpen(true);
  }

  function handleCloseReminderCenter() {
    setIsReminderCenterOpen(false);
    setFocusedReminderHabitId(null);
  }

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileMenuOpen]);

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
        focusedHabitId={focusedReminderHabitId}
        habits={habits}
        isLoading={isLoading}
        onClose={handleCloseReminderCenter}
        onSaved={fetchHabits}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-8 text-slate-950 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="grid gap-1">
              <h1 className="text-2xl font-semibold text-slate-950">My Habits</h1>
              <p className="text-sm text-slate-500">
                Signed in as <span className="font-medium text-slate-700">{user?.email ?? "Unknown user"}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button className="h-12 min-h-12 rounded-full px-5" onClick={() => setIsAddHabitOpen(true)} type="button">
                + Add Habit
              </Button>
              <div className="relative" ref={profileMenuRef}>
                <button
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  className="inline-flex h-12 items-center gap-3 rounded-full border border-slate-200 bg-white px-3 pr-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  onClick={() => setIsProfileMenuOpen((currentValue) => !currentValue)}
                  type="button"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {userInitials}
                  </span>
                  <span className="hidden sm:inline">{userInitials}</span>
                  <svg aria-hidden="true" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                    <path
                      d="m6 9 6 6 6-6"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </button>

                {isProfileMenuOpen ? (
                  <div
                    className="absolute right-0 top-[calc(100%+0.75rem)] z-20 w-64 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
                    role="menu"
                  >
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{user?.name ?? "User"}</p>
                      <p className="mt-1 text-sm text-slate-500">{user?.email ?? "Unknown user"}</p>
                    </div>
                    <div className="grid gap-1 px-2 py-2">
                      <button
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-400"
                        disabled
                        type="button"
                      >
                        <span>Profile</span>
                        <span className="text-xs font-medium uppercase tracking-[0.12em]">Later</span>
                      </button>
                      <button
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-400"
                        disabled
                        type="button"
                      >
                        <span>Settings</span>
                        <span className="text-xs font-medium uppercase tracking-[0.12em]">Later</span>
                      </button>
                      <button
                        className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        type="button"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
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
            onEditReminder={handleEditHabitReminder}
            onOpenReminders={handleOpenReminderCenter}
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
