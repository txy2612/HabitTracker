import { apiClient } from "../../../config/apiClient";

// TODO: Keep habit-specific API wrappers here if the feature needs them.
export const habitApi = {
  getHabits: apiClient.getHabits,
  createHabit: apiClient.createHabit,
  updateHabit: apiClient.updateHabit,
};
