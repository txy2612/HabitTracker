import { useMemo, useState } from "react";
import type { Habit } from "../../../shared/types/api.types";
import { EmptyState } from "../../../shared/components/EmptyState";
import { Button } from "../../../shared/components/Button";
import { HabitCard } from "./HabitCard";

type HabitSortOption =
  | "newest"
  | "oldest"
  | "alphabetical-asc"
  | "alphabetical-desc";

export type HabitListProps = {
  habits: Habit[];
  onViewHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => Promise<void>;
  onUpdateHabit: (habitId: string, name: string) => Promise<void>;
  onEditReminder: (habitId: string) => void;
  onOpenReminders: () => void;
};

export function HabitList({
  habits,
  onViewHabit,
  onDeleteHabit,
  onUpdateHabit,
  onEditReminder,
  onOpenReminders,
}: HabitListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<HabitSortOption>("newest");

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
        <p>Add your first habit to start tracking streaks.</p>
      </EmptyState>
    );
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white/90 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-xl">
          <span className="sr-only">Search habits</span>
          <input
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search habits..."
            type="search"
            value={searchQuery}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400"
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

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <label className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-sm font-medium text-slate-600">Sort</span>
            <span className="relative">
              <select
                className="h-11 min-w-[190px] appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                onChange={(event) => setSortBy(event.target.value as HabitSortOption)}
                value={sortBy}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="alphabetical-asc">Name: A-Z</option>
                <option value="alphabetical-desc">Name: Z-A</option>
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400"
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

          <Button className="h-11 rounded-xl px-4" onClick={onOpenReminders} type="button" variant="ghost">
            Reminders
          </Button>
        </div>
      </div>

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
