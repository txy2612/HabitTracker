import type { CreateHabitInput } from "../../../shared/types/api.types";

export type UseAddHabitResult = {
  isSaving: boolean;
  error: string | null;
  addHabit: (input: CreateHabitInput) => Promise<void>;
};

export function useAddHabit(): UseAddHabitResult {
  // TODO: Move add-habit form submission state here if needed.
  return {
    isSaving: false,
    error: null,
    addHabit: async (input) => {
      void input;
    },
  };
}
