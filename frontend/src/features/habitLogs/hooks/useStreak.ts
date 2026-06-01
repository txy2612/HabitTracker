import { useCallback, useState } from "react";
import { apiClient } from "../../../config/apiClient";
import type { StreakSummary } from "../../../shared/types/api.types";


export type UseStreakResult = {
  streak: StreakSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchStreak: (habitId: string) => Promise<void>;
};

/*Flow:
  1. HabitDetailPage[waiter] calls the hook
      const { streak, isLoading, error, fetchStreak, } = useStreak();
  2. React executes useStreak() [hook = kitchen]
  3. Hook creates state (as below) -> getStreaks, load, error, fetchStreaks
*/
export function useStreak(): UseStreakResult {
  const [streak, setStreak] = useState<StreakSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchStreak = useCallback(async (habitId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      //6. Call backend + backend returns streak
      const data = await apiClient.getStreak(habitId);
      //7. Save into state -> React sees state changed
      setStreak(data);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load streak.");
    } finally {
      // 8. Stop loading
      setIsLoading(false);

      // 9. HabitDetailedPage receives updated streak:
          // const { streak } = useStreak
      //10. Pass to StreakStats
          // <StreakSTats streak={streak} />
    }
  }, []);

  // 4. Hook return tools
  // 5. HabitDetailPage uses fetchStreak in useEffect = waiter serves food
  return {
    streak,
    isLoading,
    error,
    fetchStreak,
  };
}
