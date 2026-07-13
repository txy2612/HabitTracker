import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import type { CreateHabitInput } from "../../../shared/types/api.types";
import { Button } from "../../../shared/components/Button";
import { AddHabitModal } from "../components/AddHabitModal";
import { HabitList } from "../components/HabitList";
import { useHabits } from "../hooks/useHabits";
import { ArchivedHabitsPage } from "./ArchivedHabitsPage";
import { HabitDetailPage } from "./HabitDetailPage";
import { ReminderSettingsPage } from "../../reminders/ReminderSettingsPage";
import { ThemeSettingsModal } from "../../theme/ThemeSettingsModal";

function DashboardLoadingState() {
  return (
    <section className="grid gap-6" aria-label="Loading habits">
      <div className="h-[76px] animate-pulse rounded-[24px] border border-slate-200 bg-white" />
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div className="rounded-[22px] bg-white px-5 py-6 shadow-[0_2px_10px_rgba(15,23,42,0.12)]" key={item}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
              <div className="h-6 w-6 animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="grid gap-3">
              <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DashboardErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="mb-5 rounded-[24px] border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Could not load your habits</p>
          <p className="mt-1">{message}</p>
        </div>
        <Button className="self-start rounded-full px-5" onClick={onRetry} type="button" variant="secondary">
          Try again
        </Button>
      </div>
    </section>
  );
}

function DashboardSuccessState({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <section className="mb-5 rounded-[24px] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">Saved</p>
          <p className="mt-1">{message}</p>
        </div>
        <button
          className="self-start rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 transition hover:bg-emerald-100"
          onClick={onDismiss}
          type="button"
        >
          Dismiss
        </button>
      </div>
    </section>
  );
}

export function DashboardPage() {
  const { logout, user } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  
  // call useHabits {habits, isLoading, error, archive, create, delete, update } from useHabits.ts
  const {
    habits, 
    archivedHabits,
    isLoading,
    isArchivedLoading,
    error,
    archivedError,
    archiveHabit,
    createHabit,
    updateHabit,
    deleteHabit,
    fetchArchivedHabits,
    fetchHabits,
    restoreHabit,
  } = useHabits();

  // Modal state
  // onClick={() => setIsAddHabitOpen(true)} -> click opens the modal
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);

  // false -> dashboard showing, true -> reminder page showing
  const [isReminderCenterOpen, setIsReminderCenterOpen] = useState(false);
  const [isArchivedHabitsOpen, setIsArchivedHabitsOpen] = useState(false);
  const [focusedReminderHabitId, setFocusedReminderHabitId] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  function handleCloseArchivedHabits() {
    setIsArchivedHabitsOpen(false);
  }

  function handleOpenArchivedHabits() {
    setIsProfileMenuOpen(false);
    setIsArchivedHabitsOpen(true);
    void fetchArchivedHabits();
  }

  function handleOpenSettings() {
    setIsProfileMenuOpen(false);
    setIsSettingsOpen(true);
  }

  function showSuccessMessage(message: string) {
    setSuccessMessage(message);
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

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [successMessage]);

  // pass from input to useHabits
  async function handleCreateHabit(input: CreateHabitInput) {
    await createHabit(input);
  }

  function handleHabitCreated(habitName: string) {
    setIsAddHabitOpen(false);
    showSuccessMessage(`"${habitName}" was added to your habits.`);
  }

  async function handleUpdateHabitName(habitId: string, name: string) {
    await updateHabit(habitId, { name });
    showSuccessMessage("Habit name updated.");
  }

  async function handleArchiveHabit(habitId: string) {
    const habitName = habits.find((habit) => habit.id === habitId)?.name ?? "Habit";

    await archiveHabit(habitId);
    showSuccessMessage(`"${habitName}" moved to archived habits.`);
  }

  async function handleDeleteHabit(habitId: string) {
    const habitName = habits.find((habit) => habit.id === habitId)?.name ?? "Habit";

    await deleteHabit(habitId);
    showSuccessMessage(`"${habitName}" was deleted.`);
  }

  async function handleRestoreHabit(habitId: string) {
    const habitName = archivedHabits.find((habit) => habit.id === habitId)?.name ?? "Habit";

    await restoreHabit(habitId);
    showSuccessMessage(`"${habitName}" restored to your dashboard.`);
  }

  if (selectedHabit) {
    return <HabitDetailPage habit={selectedHabit} onClose={() => setSelectedHabitId(null)} />;
  }

  if (isArchivedHabitsOpen) {
    return (
      <ArchivedHabitsPage
        archivedHabits={archivedHabits}
        error={archivedError}
        isLoading={isArchivedLoading}
        onClose={handleCloseArchivedHabits}
        onDismissSuccess={() => setSuccessMessage(null)}
        onRetry={() => void fetchArchivedHabits()}
        onRestoreHabit={handleRestoreHabit}
        successMessage={successMessage}
      />
    );
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
    <main className="app-shell min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="app-card mb-6 rounded-[28px] border px-5 py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="grid gap-1">
              <h1 className="text-2xl font-bold text-[var(--app-title)]">My Habits</h1>
              <p className="text-sm text-[var(--app-muted)]">
                Signed in as <span className="font-medium text-[var(--app-text)]">{user?.email ?? "Unknown user"}</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                className="h-12 min-h-12 w-full rounded-2xl px-7 shadow-[0_16px_34px_color-mix(in_srgb,var(--app-accent)_30%,transparent)] sm:w-auto"
                onClick={() => setIsAddHabitOpen(true)}
                type="button"
              >
                + Add Habit
              </Button>
              <div className="relative" ref={profileMenuRef}>
                <button
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  className="app-soft-control inline-flex h-12 items-center gap-3 rounded-full border px-3 pr-4 text-sm font-semibold transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] focus-visible:ring-offset-2"
                  onClick={() => setIsProfileMenuOpen((currentValue) => !currentValue)}
                  type="button"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-accent)] text-xs font-bold text-white">
                    {userInitials}
                  </span>
                    <span className="hidden sm:inline">{userInitials}</span>
                  <svg aria-hidden="true" className="h-4 w-4 text-[var(--app-soft-muted)]" fill="none" viewBox="0 0 24 24">
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
                    className="app-solid-surface absolute right-0 top-[calc(100%+0.75rem)] z-20 w-64 overflow-hidden rounded-[24px] border p-2 shadow-[0_24px_60px_var(--app-shadow)]"
                    role="menu"
                  >
                    <div className="border-b border-[var(--app-border)] px-4 py-3">
                      <p className="text-sm font-semibold text-[var(--app-text)]">{user?.name ?? "User"}</p>
                      <p className="mt-1 text-sm text-[var(--app-muted)]">{user?.email ?? "Unknown user"}</p>
                    </div>
                    <div className="grid gap-1 px-2 py-2">
                      <button
                        className="rounded-xl px-3 py-2 text-left text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-soft-surface)] hover:text-[var(--app-soft-text)]"
                        onClick={handleOpenArchivedHabits}
                        type="button"
                      >
                        View archived habits
                      </button>
                      <button
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-400"
                        disabled
                        type="button"
                      >
                        <span>Profile</span>
                        <span className="text-xs font-medium uppercase tracking-[0.12em]">Later</span>
                      </button>
                      <button
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-[var(--app-text)] transition hover:bg-[var(--app-soft-surface)] hover:text-[var(--app-soft-text)]"
                        onClick={handleOpenSettings}
                        type="button"
                      >
                        <span>Settings</span>
                        <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--app-accent-strong)]">
                          Theme
                        </span>
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

        {isLoading ? <DashboardLoadingState /> : null}

        {error ? (
          <DashboardErrorState message={error} onRetry={() => void fetchHabits()} />
        ) : null}

        {successMessage && !error ? (
          <DashboardSuccessState message={successMessage} onDismiss={() => setSuccessMessage(null)} />
        ) : null}

         {/* Only show habit list after loading is done. */}
         {/* Props passed to HabitList: */}
         {/* 1)the data: habits */}
         {/* 2)actions: view, delete, move up down */}
        {!isLoading && !error ? (
          <HabitList
            habits={habits}
            onAddHabit={() => setIsAddHabitOpen(true)}
            onArchiveHabit={handleArchiveHabit}
            onDeleteHabit={handleDeleteHabit}
            onEditReminder={handleEditHabitReminder}
            onOpenReminders={handleOpenReminderCenter}
            onUpdateHabit={handleUpdateHabitName}
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
        <ThemeSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    </main>
  );
}
