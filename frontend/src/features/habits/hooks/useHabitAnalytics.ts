import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "../../../api/apiClient";
import type { HabitLog, StreakSummary } from "../../../shared/types/api.types";
import { getRecentDays } from "../../../shared/utils/dateUtils";

//eg: completedDays: 5, totlaDays: 7, percentage: 71
// why use types: w/o type, diff parts of app might acci use diff names
// but UI might expect: stats.completedDays
// export type is only used for type checking, not value
export type CompletionPeriodStats = {
    completedDays: number;
    totalDays: number;
    percentage: number;
}

// both completionstats: 7 & 30 days must follow shape of CompletionPeriodStats
// instead of defining twice, just reuse structure
export type CompletionStats = {
    lastSevenDays: CompletionPeriodStats;
    lastThirtyDays: CompletionPeriodStats;
}

// & = add new fields
// UseCompletionStatsResult CONTAINS: last7days, last30days, isLoading, error, refresh
// This is now part of UseHabitAnalyticsResult after merging the analytics hooks.
// using & AVOID REPEATING first two properties
/* WHY SEPARATE CompletionStats and UseHabitAnalyticsResult?
- CS : the analytics data
- UHAR: ana data + REQUEST STATE [req still running? did req fail? can data be fetched again?]
 */
export type UseHabitAnalyticsResult = CompletionStats & {
    completionIsLoading: boolean;
    completionError: string | null;
    // null = NO error
    // const [error, setError] = useState<string | null>(null);
    streak: StreakSummary | null;
    streakIsLoading: boolean;
    streakError: string | null;
    refreshAnalytics: () => Promise<void>;
    // function name, no para, takes time + return no useful data
    // we call it 'await refreshAnalytics()'
    // instead of receiving result 'const stats = await refreshAnalytics();'
};

// const EMPTY_COMPLETION_STATS: CompletionStats
// tells TS: This value must follow the CompletionStats structure
// { completedDays: 0,} would cause an error
/*
WHY CREATE THIS CONSTANT?

useState() needs an initial value before the backend finishes loading.

Without this, stats would be null and we'd constantly need:

if (!stats) ...

Instead, React starts with EMPTY_COMPLETION_STATS,
then later replaces it with the real statistics after setStats().
*/
const EMPTY_COMPLETION_STATS: CompletionStats = {
    lastSevenDays: { completedDays: 0, totalDays: 7, percentage: 0},
    lastThirtyDays: { completedDays: 0, totalDays: 30, percentage: 0},
}



function calculateCompletionPeriod(
    logs: HabitLog[],
    periodDates: string[],
    ): CompletionPeriodStats {
    
    // Set =/ a collection of uniq val
    // Why use Set? 
    // 'dateSet.has(date)' faster than 'periodDates.includes(date)'
    //especially when many logs are checked.
    const dateSet = new Set(periodDates);

    // another set
    const completedDates = new Set(
        logs// filter() : which habit should stay?(log) => : for each log
        .filter((log) => log.status === "done" && dateSet.has(log.logDate))//map -> ev item -> smtg else
        .map((log) => log.logDate),
    );

    // suppose completedDates = 16th, 17th, 18th -> completedDays = 3
    const completedDays = completedDates.size;
    const totalDays = periodDates.length;

    return {
        completedDays,
        totalDays,
        percentage: totalDays === 0 ? 0 : Math.round((completedDays / totalDays) * 100),
    };
}

/*Flow:
  1. HabitDetailPage[waiter] calls the hook
      const { streak, streakIsLoading, streakError, refreshAnalytics, } = useHabitAnalytics(habit.id);
  2. React executes useHabitAnalytics() [hook = kitchen]
  3. Hook creates state (as below) -> completion stats, streak, load, error, refresh
*/
// why start w 'use'? -> every hook shud start w 'use' useState(), useEffect(), useHabitAnalytics(), useReminder()
export function useHabitAnalytics(habitId: string): UseHabitAnalyticsResult {
    // use... = React hooks
    // [stats, setStates] -> js array DESTRCTURING
    const [stats, setStats] = useState<CompletionStats>(EMPTY_COMPLETION_STATS);
    // Typescript looks at 'false' -> infer it as boolean
    const [completionIsLoading, setCompletionIsLoading] = useState(false);
    // Why specify type here? 
    // if we do useState(null) -> later cant do setError("Network error")
    const [completionError, setCompletionError] = useState<string | null>(null);
    const [streak, setStreak] = useState<StreakSummary | null>(null);
    const [streakIsLoading, setStreakIsLoading] = useState(false);
    const [streakError, setStreakError] = useState<string | null>(null);
    // useRef = rmb btwn renders 
    // eg: use as counter
    // Why not use useState? -> re-renders and update UI
    const requestIdRef = useRef(0);

    // function that fetches & recalculate completion analytics
    const fetchCompletionStats = useCallback(async () => {
        // create new req id
        const requestId = requestIdRef.current + 1;
        //stores in ref
        requestIdRef.current = requestId;
        // each refresh gets an id, +1 upon request
        /* Why ev req need an ID?
            Request 1: fetch logs for Habit A
            Request 2: fetch logs for Habit B

            Request 2 might finish first
            Req 1 that fin later overwite the page

            Now the page says Habit B, but shows Habit Aâ€™s analytics.
        */

        /* try {
            // attempt request
        } catch (error) {
            // handle failure
        } finally {
            // always run cleanup
        }
        */
        try {
            setCompletionIsLoading(true);
            setCompletionError(null);

            const lastThirtyDates = getRecentDays(30);
            const lastSevenDates = lastThirtyDates.slice(-7);
            const months = [...new Set(lastThirtyDates.map((date) => date.slice(0, 7)))];
            const monthlyLogs = await Promise.all(
                months.map((month) => apiClient.getLogs(habitId, month)),
            );

            if (requestId !== requestIdRef.current) {
                return;
            }

            const logs = monthlyLogs.flat();
            setStats({
                lastSevenDays: calculateCompletionPeriod(logs, lastSevenDates),
                lastThirtyDays: calculateCompletionPeriod(logs, lastThirtyDates),
            });
        } catch (fetchError) {
            if (requestId === requestIdRef.current) {
                setCompletionError(
                fetchError instanceof Error
                    ? fetchError.message
                    : "Failed to load completion statistics.",
                );
        }
        } finally {
            if (requestId === requestIdRef.current) {
                setCompletionIsLoading(false);
            }
        }
    }, [habitId]);//dependency of useCallback -> only refresh when habitId changes

    const fetchStreak = useCallback(async () => {
      try {
        setStreakIsLoading(true);
        setStreakError(null);

        //6. Call backend + backend returns streak
        const data = await apiClient.getStreak(habitId);
        //7. Save into state -> React sees state changed
        setStreak(data);
      } catch (fetchError) {
        setStreakError(fetchError instanceof Error ? fetchError.message : "Failed to load streak.");
      } finally {
        // 8. Stop loading
        setStreakIsLoading(false);

        // 9. HabitDetailedPage receives updated streak:
            // const { streak } = useHabitAnalytics(habit.id)
        //10. Pass to HabitAnalytics
            // <HabitAnalytics streak={streak} />
      }
    }, [habitId]);

    const refreshAnalytics = useCallback(async () => {
      await Promise.all([fetchCompletionStats(), fetchStreak()]);
    }, [fetchCompletionStats, fetchStreak]);

    useEffect(() =>{
        // eslint-disable-next-line react-hooks/set-state-in-effect -- load analytics when the selected habit changes
        void refreshAnalytics();

        return () =>{
            requestIdRef.current += 1;
        };
    }, [refreshAnalytics]);

    // 4. Hook return tools
    // 5. useEffect above loads both analytics groups for HabitDetailPage
    return {
        ...stats,
        completionIsLoading,
        completionError,
        streak,
        streakIsLoading,
        streakError,
        refreshAnalytics,
    };
}
