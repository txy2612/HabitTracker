import type { StreakSummary } from "../../../shared/types/api.types";

export type UseStreakResult = {
  streak: StreakSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchStreak: (habitId: string) => Promise<void>;
};

export function useStreak(): UseStreakResult {
  // TODO: Fetch streak summary for one habit here.
  return {
    streak: null,
    isLoading: false,
    error: null,
    fetchStreak: async (habitId) => {
      void habitId;
    },
  };
}
