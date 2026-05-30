import type {
  CreateHabitInput,
  Habit,
  UpdateHabitInput,
} from "../../../shared/types/api.types";

export type UseHabitsResult = {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  fetchHabits: () => Promise<void>;
  createHabit: (input: CreateHabitInput) => Promise<void>;
  updateHabit: (habitId: string, input: UpdateHabitInput) => Promise<void>;
};

export function useHabits(): UseHabitsResult {
  // TODO: Fetch/create/update habits and keep habit state here when the database is running.
  return {
    habits: [],
    isLoading: false,
    error: null,
    fetchHabits: async () => {},
    createHabit: async (input) => {
      void input;
    },
    updateHabit: async (habitId, input) => {
      void habitId;
      void input;
    },
  };
}
