import { apiClient } from "../../../config/apiClient";
import type { StreakStats } from "../types/streak.types";

export const streakApi = {
  getStreak: (habitId: string): Promise<StreakStats> =>
    apiClient.getStreak(habitId),
};