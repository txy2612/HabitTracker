import { useMemo, useState } from "react";
import type { Habit } from "../../../shared/types/api.types";
import { EmptyState } from "../../../shared/components/EmptyState";
import { Button } from "../../../shared/components/Button";
import { HabitCard } from "./HabitCard";

// HabitSortOption is used in both DashboardPage and HabitList
// common mistake: create another in DashBoardPage
// long-term - need to update both/forgot to update one of them
// | union = OR
export type HabitSortOption =
  | "newest"
  | "oldest"
  | "alphabetical-asc"
  | "alphabetical-desc";

export type HabitListProps = {
  habits: Habit[];
  /* common mistake:
     passing only sortBy but not onSortCahnge
     dropdown visually controlled but cant update
  */
  sortBy: HabitSortOption;
  onSortChange: (sortBy: HabitSortOption) => void;
  onAddHabit: () => void;
  onViewHabit: (habitId: string) => void;
  onArchiveHabit: (habitId: string) => Promise<void>;
  onDeleteHabit: (habitId: string) => Promise<void>;
  onUpdateHabit: (habitId: string, name: string) => Promise<void>;
  onEditReminder: (habitId: string) => void;
  onOpenReminders: () => void;
};

// W/o destructuring: function HabitList(props: HabitListProps) { props.habits, props.onArchiveHabit, props.blabla }
export function HabitList({
  habits,
  sortBy,
  onSortChange,
  onAddHabit,
  onViewHabit,
  onArchiveHabit,
  onDeleteHabit,
  onUpdateHabit,
  onEditReminder,
  onOpenReminders,
}: HabitListProps) {// destructuring
  const [searchQuery, setSearchQuery] = useState("");
  // Bug: 
  //const [sortBy, setSortBy] = useState<HabitSortOption>("newest");

  //displayedHabits is calculated using:
  // - search query
  // - selected sorting nethod
  // - current habits
  const displayedHabits = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    const filteredHabits = trimmedQuery
      ? habits.filter((habit) => habit.name.toLowerCase().includes(trimmedQuery))
      : habits;

    return [...filteredHabits].sort((leftHabit, rightHabit) => {
      switch (sortBy) {
        case "oldest":
          return leftHabit.createdAt.localeCompare(rightHabit.createdAt);
        case "alphabetical-asc":
          return leftHabit.name.localeCompare(rightHabit.name, undefined, { sensitivity: "base" });
        case "alphabetical-desc":
          return rightHabit.name.localeCompare(leftHabit.name, undefined, { sensitivity: "base" });
        case "newest":
        default:
          return rightHabit.createdAt.localeCompare(leftHabit.createdAt);
      }
    });
  }, [habits, searchQuery, sortBy]);

  if (habits.length === 0) {
    return (
      <EmptyState title="No habits yet">
        <p>Add your first habit to start tracking streaks and reminders.</p>
        <Button className="mt-5 rounded-2xl px-7" onClick={onAddHabit} type="button">
          + Add Habit
        </Button>
      </EmptyState>
    );
  }

  return (
    <section className="grid gap-6">
      <div className="app-card flex flex-col gap-3 rounded-[24px] border px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-lg">
          <span className="sr-only">Search habits</span>
          <input
            className="app-soft-control h-11 w-full rounded-xl border px-4 pr-11 text-sm outline-none transition placeholder:text-[var(--app-soft-muted)] focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent-soft)]"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search habits..."
            type="search"
            value={searchQuery}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--app-soft-muted)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path
                d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </span>
        </label>

        <div className="grid gap-3 sm:grid-cols-[minmax(190px,1fr)_auto] sm:items-center lg:flex lg:flex-wrap lg:justify-end">
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--app-muted)]">Sort</span>
            <span className="relative">
              {/* change setSortBy to onSortChange . WHy?
              - onSortChange updates the parent state as well
              - when dropdown changes, both the list & month arrwos stays sync
              */}
              <select
                className="app-soft-control h-11 min-w-[190px] appearance-none rounded-xl border px-3 pr-10 text-sm outline-none transition focus:border-[var(--app-accent)] focus:ring-2 focus:ring-[var(--app-accent-soft)]"
                onChange={(event) => onSortChange(event.target.value as HabitSortOption)}
                value={sortBy}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="alphabetical-asc">Name: A-Z</option>
                <option value="alphabetical-desc">Name: Z-A</option>
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--app-soft-muted)]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <path
                    d="m6 9 6 6 6-6"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </span>
            </span>
          </label>

          <Button
            className="app-secondary-control h-11 rounded-2xl border px-5 text-sm font-semibold hover:brightness-105"
            onClick={onOpenReminders}
            type="button"
            variant="ghost"
          >
            <span className="inline-flex items-center gap-2">
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path
                  d="M7 10a5 5 0 0 1 10 0v3.6l1.4 2.2A1.4 1.4 0 0 1 17.2 18H6.8a1.4 1.4 0 0 1-1.2-2.2L7 13.6V10Zm3 8a2 2 0 0 0 4 0"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              Reminders
            </span>
          </Button>
        </div>
      </div>

      {/* Ternarary operator */}
      {/* If there are no habits to display: EmptyState */}
      {/* Otherwise: */}
      {displayedHabits.length === 0 ? (
        <EmptyState title="No matching habits">
          <p>Try another habit name.</p>
        </EmptyState> 
      ) : ( 
        <div className="grid gap-6 lg:grid-cols-2">
          {displayedHabits.map((habit) => (
            <HabitCard
              habit={habit}
              key={habit.id}
              onArchiveHabit={onArchiveHabit}
              onDeleteHabit={onDeleteHabit}
              onEditReminder={onEditReminder}
              onUpdateHabit={onUpdateHabit}
              onViewHabit={onViewHabit}
            />
          ))}
        </div>
      )}
    </section>
  );
}
