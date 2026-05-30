import { apiClient } from "../../../config/apiClient";
import type { CreateHabitInput, UpdateHabitInput } from "../types/habit.types";

export const habitApi = {
  getHabits: () =>
    apiClient.getHabits(),

  createHabit: (input: CreateHabitInput) =>
    apiClient.createHabit(input.name),

  updateHabit: (habitId: string, input: UpdateHabitInput) =>
    apiClient.updateHabit(habitId, input),
};
